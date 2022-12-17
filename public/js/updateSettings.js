/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

export const updateData = async (formDataObj) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3000/api/v1/users/updateMe',
      data: formDataObj,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'data successfully updated');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const updatePassword = async (
  passwordCurrent,
  passwordConfirm,
  password
) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3000/api/v1/users/updateMyPassword',
      data: {
        passwordCurrent,
        password,
        passwordConfirm,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'data successfully updated');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
