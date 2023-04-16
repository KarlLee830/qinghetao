
class PasswordSetting {
  #DIGIT = 0;
  #LOWERCASE = 1;
  #SIGN = 2;
  #UPPERCASE = 3;
  #LENGTH = 4;
  #minLength= 0;
  #checkers = {
    [this.#DIGIT]: { checker: /\d/, type: 'digit' },
    [this.#LOWERCASE]: { checker: /[a-z]/, type: 'lowercase' },
    [this.#SIGN]: { checker: /[~`!@#$%^&*()_+=/{}[\]'":;,.<>?-]/, type: 'sign' },
    [this.#UPPERCASE]: { checker: /[A-Z]/, type: 'uppercase' },
  }

  #validators = []

  constructor(site) {
    try {
      const { webConfig: { setReg: { passwordLength = 0, passwordStrength = [] } = {} } = {} } = site;
      if (passwordLength !== 0) {
        this.#validators.push({ validator: new RegExp(`.{${passwordLength},}`), type: 'length' });
      }
      passwordStrength.forEach((checkerType) => {
        const checker = this.#checkers[checkerType];
        checker && this.#validators.push(checker);
      });
    } catch (e) {
      this.#validators = [];
    }
  }

  getValidators() {
    return this.#validators;
  }

  getMinLength() {
    return this.#minLength;
  }
}

export  default PasswordSetting;

