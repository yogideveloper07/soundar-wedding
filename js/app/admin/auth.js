import { util } from '../../common/util.js';
import { dto } from '../../connection/dto.js';
import { storage } from '../../common/storage.js';
import { session } from '../../common/session.js';
import { bootstrap } from '../../libs/bootstrap.js';
import { request, HTTP_GET } from '../../connection/request.js';

export const auth = (() => {

    /**
     * @type {ReturnType<typeof storage>|null}
     */
    let user = null;

    /**
     * @param {HTMLButtonElement} button
     * @returns {Promise<void>}
     */
    const login = async (button) => {
        const btn = util.disableButton(button);

        const formEmail = document.getElementById('loginEmail');
        const formPassword = document.getElementById('loginPassword');

        formEmail.disabled = true;
        formPassword.disabled = true;

        const res = await session.login(dto.postSessionRequest(formEmail.value, formPassword.value));
        if (res) {
            formEmail.value = null;
            formPassword.value = null;
            bootstrap.Modal.getOrCreateInstance('#mainModal').hide();
        }

        btn.restore();
        formEmail.disabled = false;
        formPassword.disabled = false;
    };

    /**
     * @returns {Promise<ReturnType<typeof dto.baseResponse>>}
     */
    const getDetailUser = () => {
        return request(HTTP_GET, '/api/user').token(session.getToken()).send().then((res) => {
            if (res.code !== 200) {
                return res;
            }

            for (let [k, v] of Object.entries(res.data)) {
                user.set(k, v);
            }

            return res;
        }, clearSession);
    };

    /**
     * @returns {ReturnType<typeof storage>|null}
     */
    const getUserStorage = () => {
        return user;
    };

    /**
     * @returns {void}
     */
    const clearSession = () => {
        user.clear();
        session.logout();
        bootstrap.Modal.getOrCreateInstance('#mainModal').show();
    };

    /**
     * @returns {void}
     */
    const init = () => {
        user = storage('user');
    };

    return {
        init,
        login,
        clearSession,
        getDetailUser,
        getUserStorage,
    };
})();