export default {
  // This is the list of languages your application supports
  supportedLngs: ['en', 'nb'],
  // This is the language you want to use in case the user language is not in the supportedLngs
  fallbackLng: 'nb',
  // The default namespace. We use namespaces to separates version of our texts for different dates, i.e. namespace = date
  // 1000-01-01 is the earliest date, so we use it as the default namespace
  defaultNS: '1000-01-01',
  // Disabling suspense is recommended
  react: { useSuspense: false },
};
