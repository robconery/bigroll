import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.globalProperties.$filters = {
    duration(num: number | string) {
      if (!num) return '';
      if (typeof num === 'string' && num.includes(':')) return num;
      
      const sec_num = parseInt(String(num), 10); // don't forget the second param
      let hours: number | string = Math.floor(sec_num / 3600);
      let minutes: number | string = Math.floor((sec_num - (hours * 3600)) / 60);
      let seconds: number | string = sec_num - (hours * 3600) - (minutes * 60);

      hours = hours < 10 ? `0${hours}` : hours.toString();
      minutes = minutes < 10 ? `0${minutes}` : minutes.toString();
      seconds = seconds < 10 ? `0${seconds}` : seconds.toString();
      
      return `${minutes}:${seconds}`;
    }
  }
})
