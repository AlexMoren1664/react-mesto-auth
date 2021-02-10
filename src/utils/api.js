export class Api {
    constructor(options) {
      this._baseUrl = options.baseUrl;
      this._headers = options.headers;
    }
  
    getUserInfo() {
      return fetch(`${this._baseUrl}/users/me`, {
        headers: this._headers,
      }).then(this._getResponse);
    }
  
    getInitialCards() {
      return fetch(`${this._baseUrl}/cards`, {
        headers: this._headers,
      }).then(this._getResponse);
    }
  
    editUserInfo(data) {
      return fetch(`${this._baseUrl}/users/me`, {
        headers: this._headers,
        method: "PATCH",
        body: JSON.stringify({
          name: data.name,
          about: data.about,
        }),
      }).then(this._getResponse);
    }
  
    getNewCard(data) {
      return fetch(`${this._baseUrl}/cards`, {
        headers: this._headers,
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          link: data.link,
        }),
      }).then(this._getResponse);
    }
  
    deleteCard(cardId) {
      return fetch(`${this._baseUrl}/cards/${cardId}`, {
        headers: this._headers,
        method: "DELETE",
      }).then(this._getResponse);
    }
  
    changeLikeCardStatus(cardId, isLiked) {
      return fetch(`${this._baseUrl}/cards/likes/${cardId}`, {
        headers: this._headers,
        method: isLiked ? "PUT" : "DELETE",
      }).then(this._getResponse);
    }
  
    updateAvatar(data) {
      return fetch(`${this._baseUrl}/users/me/avatar`, {
        headers: this._headers,
        method: "PATCH",
        body: JSON.stringify({
          avatar: data.link,
        }),
      }).then(this._getResponse);
    }
  
    _getResponse(res) {
      if (res.ok) {
        return res.json();
      } else {
        return Promise.reject(new Error(`Ошибка: ${res.status}`));
      }
    }
  }
  
  const api = new Api({
    baseUrl: "https://mesto.nomoreparties.co/v1/cohort-17",
    headers: {
      authorization: "7bd94261-5a21-4877-bf79-305be7d353ce",
      "Content-Type": "application/json",
    },
  });
  export default api;
  