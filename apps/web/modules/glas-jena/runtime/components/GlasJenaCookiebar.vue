<template>
  <section
    v-if="visible"
    class="gj-cookiebar z-cookiebar"
    role="dialog"
    aria-labelledby="gj-cookiebar-title"
    data-testid="gj-cookiebar"
  >
    <div class="gj-cookiebar__inner">
      <!-- First level: short text and three equally prominent actions -->
      <template v-if="!showSettings">
        <div class="gj-cookiebar__text">
          <h2 id="gj-cookiebar-title" class="gj-cookiebar__title">{{ tBanner('title') }}</h2>
          <p>{{ tBanner('text') }}</p>
          <p class="gj-cookiebar__links">
            <NuxtLink :to="localePath(paths.privacyPolicy)">{{ t('CookieBar.keys.PrivacyPolicy') }}</NuxtLink>
            <span aria-hidden="true">·</span>
            <NuxtLink :to="localePath(paths.legalDisclosure)">{{ t('legal.legalDisclosure') }}</NuxtLink>
          </p>
        </div>

        <div class="gj-cookiebar__actions">
          <button
            type="button"
            class="gj-cookiebar__button gj-cookiebar__button--primary"
            data-testid="cookie-bar-accept-all"
            @click="setAllCookiesState(true)"
          >
            {{ tBanner('acceptAll') }}
          </button>
          <button
            type="button"
            class="gj-cookiebar__button gj-cookiebar__button--primary"
            data-testid="gj-cookiebar-reject"
            @click="setAllCookiesState(false)"
          >
            {{ tBanner('reject') }}
          </button>
          <button
            type="button"
            class="gj-cookiebar__button gj-cookiebar__button--light"
            data-testid="gj-cookiebar-settings"
            @click="showSettings = true"
          >
            {{ tBanner('settings') }}
          </button>
        </div>
      </template>

      <!-- Second level: the cookie groups with switches -->
      <template v-else>
        <div class="gj-cookiebar__settings">
          <h2 id="gj-cookiebar-title" class="gj-cookiebar__title">{{ tBanner('settingsTitle') }}</h2>
          <ul class="gj-cookiebar__groups">
            <template v-for="(cookieGroup, groupIndex) in cookieGroups" :key="cookieGroup.name">
              <li v-if="cookieGroup.cookies?.length" class="gj-cookiebar__group">
                <!-- Essential cookies cannot be switched off: a clear "always active" instead of a greyed-out switch -->
                <div v-if="groupIndex === defaults.ESSENTIAL_COOKIES_INDEX" class="gj-cookiebar__group-head">
                  <span class="gj-cookiebar__group-name">{{ t(cookieGroup.name) }}</span>
                  <span class="gj-cookiebar__always" data-testid="gj-cookiebar-always-active">{{
                    tBanner('alwaysActive')
                  }}</span>
                </div>
                <label v-else class="gj-cookiebar__group-head">
                  <span class="gj-cookiebar__group-name">{{ t(cookieGroup.name) }}</span>
                  <SfSwitch v-model="cookieGroup.accepted" @update:model-value="acceptGroup(cookieGroup)" />
                </label>
                <p class="gj-cookiebar__group-text">{{ t(cookieGroup.description) }}</p>
                <button type="button" class="gj-cookiebar__more" @click="cookieGroup.showMore = !cookieGroup.showMore">
                  {{ cookieGroup.showMore ? t('CookieBar.Show less') : t('CookieBar.More information') }}
                </button>
                <dl v-if="cookieGroup.showMore" class="gj-cookiebar__cookies">
                  <div v-for="cookie in cookieGroup.cookies" :key="cookie.name" class="gj-cookiebar__cookie">
                    <dt>{{ t(cookie.name) }}</dt>
                    <dd v-for="propKey in getCookieDetailKeys(cookie)" :key="propKey">
                      <span>{{ t(`CookieBar.keys.${propKey}`) }}:</span>
                      <!-- Like the original banner: external privacy links open in a new tab, otherwise our own page -->
                      <NuxtLink
                        v-if="propKey === PRIVACY_POLICY_KEY"
                        :to="getPrivacyPolicyLink(cookie)"
                        :target="isExternalLink(getPrivacyPolicyLink(cookie)) ? '_blank' : undefined"
                      >
                        {{ t('CookieBar.Privacy Settings') }}
                      </NuxtLink>
                      <template v-else>{{ getCookieDetailText(cookie, propKey) }}</template>
                    </dd>
                  </div>
                </dl>
              </li>
            </template>
          </ul>
        </div>

        <div class="gj-cookiebar__actions">
          <button
            type="button"
            class="gj-cookiebar__button gj-cookiebar__button--primary"
            data-testid="gj-cookiebar-save"
            @click="setConsent()"
          >
            {{ tBanner('save') }}
          </button>
          <button
            type="button"
            class="gj-cookiebar__button gj-cookiebar__button--primary"
            @click="setAllCookiesState(true)"
          >
            {{ tBanner('acceptAll') }}
          </button>
          <button type="button" class="gj-cookiebar__button gj-cookiebar__button--light" @click="showSettings = false">
            {{ t('CookieBar.Back') }}
          </button>
        </div>
      </template>
    </div>
  </section>

  <!-- Reopens the banner at any time, so the consent can be changed or withdrawn -->
  <button
    v-else
    type="button"
    class="gj-cookiebar__open z-cookiebar"
    :aria-label="t('CookieBar.Cookie Settings')"
    :title="t('CookieBar.Cookie Settings')"
    data-testid="cookie-bar-open-btn"
    @click="changeVisibilityState"
  >
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path
        d="M9 16h.01M12 11h.01M7 10h.01M15 16h.01M21 12a9 9 0 1 1-9-9c0 2.761 1.79 5 4 5 0 2.21 2.239 4 5 4z"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { SfSwitch } from '@storefront-ui/vue';
import type { Cookie, CookieGroup } from '@plentymarkets/shop-core';

/**
 * Cookie banner in the GLAS IN JENA style: flat, compact, three equally prominent actions on the first level
 * ("Alle akzeptieren", "Ablehnen", "Einstellungen"), the cookie groups with switches on the second level.
 * Only the surface is new: consent, groups and storage stay with the shop's `useCookieBar`.
 */
const { cookieGroups, visible, setConsent, setAllCookiesState, changeVisibilityState } = useCookieBar();
/* Own short texts (below); shop texts such as cookie group names come from the global `t` */
const { t: tBanner } = useI18n({ useScope: 'local' });
const localePath = useLocalizedPath();
const showSettings = ref(false);

/** Properties of a cookie that are not shown as details (like in the original banner). */
const HIDDEN_COOKIE_KEYS = ['name', 'accepted', 'cookieNames'];

const acceptGroup = (group: CookieGroup) => {
  group.cookies.forEach((cookie: Cookie) => {
    cookie.accepted = group.accepted;
  });
};

const getCookieDetailKeys = (cookie: Cookie) =>
  Object.keys(cookie).filter((key) => !HIDDEN_COOKIE_KEYS.includes(key) && cookie[key as keyof Cookie]);

/** Cookie property with the privacy link: a full URL of the provider, or a placeholder for our own page. */
const PRIVACY_POLICY_KEY = 'PrivacyPolicy';
const EXTERNAL_LINK_PREFIX = 'http';

const isExternalLink = (link: string) => link.startsWith(EXTERNAL_LINK_PREFIX);

const getPrivacyPolicyLink = (cookie: Cookie) => {
  const value = cookie[PRIVACY_POLICY_KEY as keyof Cookie]?.toString() ?? '';
  return isExternalLink(value) ? value : localePath(paths.privacyPolicy);
};

const getCookieDetailText = (cookie: Cookie, key: string) => {
  const value = cookie[key as keyof Cookie]?.toString() ?? '';
  return value.startsWith('CookieBar.') ? t(value) : value;
};
</script>

<i18n lang="json">
{
  "de": {
    "title": "Ihre Privatsphäre",
    "text": "Wir verwenden Cookies und ähnliche Technologien. Technisch notwendige sind immer aktiv. Weitere – etwa für Statistik oder Versand- und Zahlungsdienste – setzen wir nur mit Ihrer Einwilligung ein. Ihre Auswahl können Sie jederzeit über das Cookie-Symbol unten links ändern.",
    "acceptAll": "Alle akzeptieren",
    "reject": "Ablehnen",
    "settings": "Einstellungen",
    "settingsTitle": "Cookie-Einstellungen",
    "save": "Auswahl speichern",
    "alwaysActive": "Immer aktiv"
  },
  "en": {
    "title": "Your privacy",
    "text": "We use cookies and similar technologies. Technically necessary ones are always active. Others – for example for statistics or shipping and payment services – are only used with your consent. You can change your choice at any time via the cookie icon at the bottom left.",
    "acceptAll": "Accept all",
    "reject": "Reject",
    "settings": "Settings",
    "settingsTitle": "Cookie settings",
    "save": "Save selection",
    "alwaysActive": "Always active"
  }
}
</i18n>

<style scoped>
/*
 * Flat bar at the bottom like the rest of the shop: white across the whole window with a line on top from the left
 * to the right edge instead of a shadow; the content stays in the header box (`__inner`). Text left and actions
 * right on large screens; on phones a compact panel with stacked buttons.
 * Above the original mobile NavbarBottom where it is still shown (auth layout).
 */
.gj-cookiebar {
  position: fixed;
  right: 0;
  bottom: var(--gj-mobile-navbar-height);
  left: 0;
  max-height: 85vh;
  overflow-y: auto;
  background-color: #fff;
  border-top: 3px solid var(--gj-slate-blue);
  color: var(--gj-text);
}

.gj-cookiebar__inner {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: var(--gj-box-width);
  margin: 0 auto;
  padding: 1.25rem 1rem;
}

.gj-cookiebar__title {
  margin: 0 0 0.35rem;
  font-size: 1.5rem;
  line-height: 1.2;
  font-weight: 300;
}

.gj-cookiebar__text p {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.45;
}

.gj-cookiebar__links {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.4rem !important;
}

.gj-cookiebar a,
.gj-cookiebar__more {
  color: var(--gj-mid-blue);
  text-decoration: underline;
}

.gj-cookiebar__actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Same size and weight for accepting and rejecting; settings as a light tile like the header's */
.gj-cookiebar__button {
  min-height: 2.75rem;
  padding: 0.5rem 1.25rem;
  font-size: 1rem;
  white-space: nowrap;
}

.gj-cookiebar__button--primary {
  background-color: var(--gj-slate-blue);
  color: #fff;
}

.gj-cookiebar__button--light {
  background-color: #ebebeb;
  color: var(--gj-text);
}

.gj-cookiebar__button:hover {
  filter: brightness(0.93);
}

.gj-cookiebar__groups {
  margin: 0.5rem 0 0;
  padding: 0;
  list-style: none;
}

.gj-cookiebar__group {
  padding: 0.75rem 0;
  border-top: 1px solid #e6e6e6;
}

.gj-cookiebar__group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  cursor: pointer;
}

.gj-cookiebar__group-name {
  font-weight: 600;
}

.gj-cookiebar__always {
  font-size: 0.875rem;
  color: var(--gj-slate-blue);
}

.gj-cookiebar__group-text {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  line-height: 1.4;
}

.gj-cookiebar__more {
  font-size: 0.875rem;
}

.gj-cookiebar__cookies {
  margin: 0.5rem 0 0;
  font-size: 0.8125rem;
}

.gj-cookiebar__cookie {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background-color: var(--gj-footnote-bg);
}

.gj-cookiebar__cookie dt {
  font-weight: 600;
}

.gj-cookiebar__cookie dd {
  margin: 0;
  overflow-wrap: anywhere;
}

.gj-cookiebar__cookie dd span {
  color: var(--gj-text-muted);
}

/* Square button to reopen the banner, bottom left */
.gj-cookiebar__open {
  position: fixed;
  bottom: calc(0.5rem + var(--gj-mobile-navbar-height));
  left: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  background-color: var(--gj-slate-blue);
  color: #fff;
}

/* Phones: at most about 40 % of the screen for the first level */
@media (max-width: 767.98px) {
  .gj-cookiebar {
    max-height: 70vh;
  }

  .gj-cookiebar__title {
    font-size: 1.25rem;
  }

  .gj-cookiebar__text p {
    font-size: 0.875rem;
  }

  /* Accept and reject side by side (equally wide), the third action below them across the full width */
  .gj-cookiebar__actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .gj-cookiebar__actions .gj-cookiebar__button:last-child {
    grid-column: 1 / -1;
  }

  .gj-cookiebar__button {
    padding: 0.5rem;
  }
}

/* From 768 px: text left, actions right in one row */
@media (min-width: 768px) {
  .gj-cookiebar__inner {
    flex-direction: row;
    align-items: center;
    gap: 2rem;
    padding: 1.25rem 1.5rem;
  }

  .gj-cookiebar__text,
  .gj-cookiebar__settings {
    flex: 1;
  }

  .gj-cookiebar__actions {
    flex-shrink: 0;
    flex-direction: row;
  }
}

/* The settings level needs the width for the groups: actions below them */
@media (min-width: 768px) {
  .gj-cookiebar__inner:has(.gj-cookiebar__settings) {
    flex-direction: column;
    align-items: stretch;
  }

  .gj-cookiebar__inner:has(.gj-cookiebar__settings) .gj-cookiebar__actions {
    justify-content: flex-end;
  }
}
</style>
