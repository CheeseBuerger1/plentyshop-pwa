export type DidYouKnowTextAlignment = 'left' | 'center' | 'right';

export type DidYouKnowContent = {
  text: {
    title?: string;
    facts?: string[];
    showIcon?: boolean;
    textAlignment?: DidYouKnowTextAlignment;
  };
  autoplay?: {
    /** Seconds until the next fact is shown automatically; 0 disables autoplay. */
    interval?: number;
  };
  layout: {
    backgroundColor?: string;
    textColor?: string;
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
    fullWidth?: boolean;
  };
};

export type DidYouKnowProps = {
  name: string;
  type: string;
  meta: {
    uuid: string;
  };
  configuration?: {
    visible?: boolean;
  };
  content: DidYouKnowContent;
  index?: number;
};

export type DidYouKnowFormProps = {
  uuid?: string;
};

/** Content as the editor form works with it: every optional setting filled in. */
export type NormalizedDidYouKnowContent = DidYouKnowContent & {
  text: DidYouKnowContent['text'] & { facts: string[] };
  autoplay: { interval: number };
};
