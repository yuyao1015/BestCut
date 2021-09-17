import { PropComType } from '@/enums/viewItem';

export interface PropEditInfo {
  editable: boolean;
  edit: {
    component: PropComType;
    props: any;
    checkValid: ((val: any) => boolean | string) | null;
  };

  title: string;
  value: any;
}
