import { createContactValidationSchema } from '../contactForm';

const validInput = {
  email: 'kunde@example.com',
  message: 'Frage zur Teekanne',
  name: '',
  subject: 'Teekanne',
  orderId: '',
  privacyPolicy: true,
  turnstile: '',
};

/** Names of the invalid fields, sorted */
const invalidFields = async (input: Record<string, unknown>, turnstileRequired = false) => {
  const { errors } = await createContactValidationSchema(turnstileRequired).parse(input);
  return errors.map((error) => error.path).sort();
};

describe('createContactValidationSchema', () => {
  it('should accept a complete request without the optional fields', async () => {
    expect(await invalidFields(validInput)).toEqual([]);
  });

  it('should require email, subject, message and the privacy confirmation', async () => {
    const input = { ...validInput, email: '', subject: '', message: '', privacyPolicy: false };

    expect(await invalidFields(input)).toEqual(['email', 'message', 'privacyPolicy', 'subject']);
  });

  it('should only accept digits as order number', async () => {
    expect(await invalidFields({ ...validInput, orderId: 'A-12' })).toEqual(['orderId']);
    expect(await invalidFields({ ...validInput, orderId: '4711' })).toEqual([]);
  });

  it('should require the spam check only when Turnstile is set up', async () => {
    expect(await invalidFields(validInput, false)).toEqual([]);
    expect(await invalidFields(validInput, true)).toEqual(['turnstile']);
  });
});
