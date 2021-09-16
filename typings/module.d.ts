declare type ReadonlyRecordable<T = any> = {
  readonly [key: string]: T;
};

declare module 'moment/dist/locale/*' {
  import { LocaleSpecification } from 'moment';
  const locale: LocaleSpecification & ReadonlyRecordable;
  export default locale;
}
