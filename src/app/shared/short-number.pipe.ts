import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'shortNumber'
})
export class ShortNumberPipe implements PipeTransform {

  transform(value: number): string {
    if (!value) return '';

    let formattedValue: string;
    if (value >= 1000) {
      const suffixIndex = Math.floor(Math.log(value) / Math.log(1000));
      const number = value / Math.pow(1000, suffixIndex);
      formattedValue = Math.round(number).toString() + 'k';
    } else {
      formattedValue = value.toString();
    }

    return formattedValue;
  }
}
