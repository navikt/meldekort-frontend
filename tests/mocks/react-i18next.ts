// Importeres som en fil via vi.importActual
export const mock = {
  useTranslation: () => {
    return {
      t: (args: string[]) => {
        if (args[1] === 'korriger.begrunnelse.valg') {
          return '{"1": "Op1", "2": "Op2"}';
        }

        return args[1];
      },
      i18n: {
        changeLanguage: () => new Promise(() => {
        }),
        setDefaultNamespace: (ns: string) => {
        },
        dir: () => {
        }
      },
      ready: true
    };
  }
};
