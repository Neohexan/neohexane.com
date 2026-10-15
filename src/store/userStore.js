import { persistentAtom } from '@nanostores/persistent';

// This automatically saves to and reads from localStorage under 'payload-user'
export const $user = persistentAtom('payload-user', null, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const isUserLoggedIn = (userObj) => {
  return Boolean(
    userObj &&
    typeof userObj === 'object' &&
    Object.keys(userObj).length > 0 &&
    (userObj.id || userObj.email || userObj.name)
  );
};
