export interface Properties{

  id: number;
  type: PropertyType;
  name: string;
  label: string;
  value: string;
  enabled: boolean;

}

export enum PropertyType {
  BOOLEAN = 'BOOLEAN',
  SCHEDULER = 'SCHEDULER',
  EMAIL = 'EMAIL',
}
