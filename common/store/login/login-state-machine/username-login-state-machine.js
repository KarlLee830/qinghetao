
import stoore from '@common/store';

const steps = ['username-login', 'set-nickname', 'set-extra-info', 'check-user-status'];

let currenStepIndex = 0;
let currenStep = steps[currenStepIndex];

const states = {
  'username-login': {
    entry() {

    },
    next(router) {
      currenStepIndex++;
      currentStep = steps[currenStepIndex];
      router.push({ pathname: currentStep });
      curens
    },
  },
  'set-nickname':{
    entry(){

    }
  }
};

