// Importeres som en fil via vi.importActual
import { getEnv } from '~/utils/envUtils';

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
        setDefaultNamespace: () => {
        },
        hasLoadedNamespace: () => {
          return !getEnv('IS_LOCALHOST');
        },
        dir: () => {
        }
      },
      ready: true
    };
  }
};
