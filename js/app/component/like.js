import { dto } from '../../connection/dto.js';
import { storage } from '../../common/storage.js';
import { session } from '../../common/session.js';
import { confetti, tapTapAnimation } from '../../libs/confetti.js';
import { request, HTTP_PATCH, HTTP_POST } from '../../connection/request.js';

export const like = (() => {

    /**
     * @type {ReturnType<typeof storage>|null}
     */
    let likes = null;

    /**
     * @param {HTMLButtonElement} button
     * @returns {Promise<void>}
     */
    const like = async (button) => {
        const id = button.getAttribute('data-uuid');

        const info = button.firstElementChild;
        const heart = button.lastElementChild;

        button.disabled = true;

        if (likes.has(id)) {
            await request(HTTP_PATCH, '/api/comment/' + likes.get(id))
                .token(session.getToken())
                .send(dto.statusResponse)
                .then((res) => {
                    if (res.data.status) {
                        likes.unset(id);

                        heart.classList.remove('fa-solid', 'text-danger');
                        heart.classList.add('fa-regular');

                        info.setAttribute('data-count-like', (parseInt(info.getAttribute('data-count-like')) - 1).toString());
                    }
                });
        } else {
            await request(HTTP_POST, '/api/comment/' + id)
                .token(session.getToken())
                .send(dto.uuidResponse)
                .then((res) => {
                    if (res.code == 201) {
                        likes.set(id, res.data.uuid);

                        heart.classList.remove('fa-regular');
                        heart.classList.add('fa-solid', 'text-danger');

                        info.setAttribute('data-count-like', (parseInt(info.getAttribute('data-count-like')) + 1).toString());
                    }
                });
        }

        info.innerText = info.getAttribute('data-count-like');
        button.disabled = false;
    };

    /**
     * @param {HTMLElement} div
     * @returns {Promise<void>}
     */
    const tapTap = async (div) => {
        if (!navigator.onLine) {
            return;
        }

        const currentTime = Date.now();
        const tapLength = currentTime - parseInt(div.getAttribute('data-tapTime'));
        const uuid = div.id.replace('body-content-', '');

        if (tapLength < 300 && tapLength > 0 && !likes.has(uuid) && div.getAttribute('data-liked') !== 'true') {
            if (navigator.vibrate) {
                navigator.vibrate(100);
            }

            if (confetti) {
                tapTapAnimation(div);
            }

            div.setAttribute('data-liked', 'true');
            await like(document.querySelector(`[onclick="undangan.comment.like.like(this)"][data-uuid="${uuid}"]`));
            div.setAttribute('data-liked', 'false');
        }

        div.setAttribute('data-tapTime', currentTime);
    };

    /**
     * @returns {void}
     */
    const init = () => {
        likes = storage('likes');
    };

    return {
        init,
        like,
        tapTap,
    };
})();