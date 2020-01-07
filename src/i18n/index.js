import Vue from 'vue'
import VueI18n from 'vue-i18n'
import zh from './lang/zh.js'
import en from './lang/en.js'
Vue.use(VueI18n)

let a = localStorage.locale === 'en' ? 'en' : 'zh'
const i18n = new VueI18n({
  locale: a || 'zh',
  messages: {
    zh,
    en
  }
})

export default i18n
