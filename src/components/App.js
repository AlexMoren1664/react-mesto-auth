import React from "react";
import Footer from "./Footer";
import Main from "./Main";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./Login";
import Register from "./Register";
import ImagePopup from "./ImagePopup";
import { useState, useEffect } from "react";
import { CurrentUserContext } from "../contexts/CurrentUserContext.js";
import api from "../utils/api.js";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import InfoTooltip from "./InfoTooltip";
import { Route, Switch, Redirect, useHistory } from "react-router-dom";
import * as auth from "../auth";
import imgError from "../images/error.svg";
import imgOk from "../images/ok.svg";

function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState({});
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const history = useHistory();
  const [userData, setUserData] = useState({
    email: "",
  });
  const [isInfoTooltip, setIsInfoTooltip] = useState(false);
  const [infoStatus, setInfoStatus] = useState({
    image: "",
    message: "",
  });

  function handleInfoTooltip() {
    setIsInfoTooltip(true);
  }

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      function tokenCheck() {
        return auth
          .getContent(localStorage.getItem("jwt"))
          .then((res) => {
            setLoggedIn(true);
            setUserData({ email: res.data.email });
            history.push("/");
          })
          .catch((err) => {
            console.log(err);
          });
      }
      tokenCheck();
    }
  }, [history]);

  function handleRegister(data) {
    const { email, password } = data;
    return auth
      .register(email, password)
      .then((res) => {
        if (res) {
          setIsInfoTooltip(true);
          setInfoStatus({
            image: imgOk,
            message: "Вы успешно зарегистрировались!.",
          });
          history.push("/sign-in");
        }
      })
      .catch((err) => {
        setIsInfoTooltip(true);
        setInfoStatus({
          image: imgError,
          message: "Что-то пошло не так! Попробуйте ещё раз.",
        });

        console.log("Ошибка:", err);
      });
  }

  function handleLogin(data) {
    const { email, password } = data;
    return auth
      .autorize(email, password)
      .then((res) => {
        if (res.token) {
          setLoggedIn(true);
          setUserData({
            email: email,
          });
          localStorage.setItem("jwt", res.token);
        }
      })
      .then(() => history.push("/"))
      .catch((err) => {
        setIsInfoTooltip(true);
        setInfoStatus({
          image: imgError,
          message: "Что-то пошло не так! Попробуйте ещё раз.",
        });
        console.log("Ошибка:", err);
      });
  }

  function signOut() {
    localStorage.removeItem("jwt");
    history.push("/sign-in");
    setLoggedIn(false);
  }

  useEffect(() => {
    Promise.all([api.getUserInfo(), api.getInitialCards()])
      .then(([info, cardUser]) => {
        setCurrentUser(info);
        setCards(cardUser);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  function handleCardClick(props) {
    setSelectedCard({
      src: props.src,
      name: props.name,
    });
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function closeAllPopups() {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setSelectedCard({});
    setIsInfoTooltip(false);
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some((i) => i._id === currentUser._id);
    api
      .changeLikeCardStatus(card._id, !isLiked)
      .then((newCard) => {
        const newCards = cards.map((c) => (c._id === card._id ? newCard : c));
        setCards(newCards);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleCardDelete(card) {
    api
      .deleteCard(card._id)
      .then(() => {
        const car = cards.filter((c) => c._id !== card._id);
        setCards(car);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleUpdateUser(data) {
    api
      .editUserInfo(data)
      .then((res) => {
        setCurrentUser(res);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      });
  }
  function handleUpdateAvatar(data) {
    api
      .updateAvatar(data)
      .then((res) => {
        setCurrentUser(res);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleAddPlaceSubmit(data) {
    api
      .getNewCard(data)
      .then((res) => {
        setCards([res, ...cards]);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <>
        <div className="page">
          <div className="page__content">
            <Switch>
              <ProtectedRoute
                exact
                path="/"
                userData={userData.email}
                onEditAvatar={handleEditAvatarClick}
                onEditProfile={handleEditProfileClick}
                onAddPlace={handleAddPlaceClick}
                onCardClick={handleCardClick}
                cards={cards}
                onCardLike={handleCardLike}
                onCardDelete={handleCardDelete}
                component={Main}
                onInfoTooltip={handleInfoTooltip}
                loggedIn={loggedIn}
                signOut={signOut}
              />
              <Route path="/sign-up">
                <Register onRegister={handleRegister} />
              </Route>
              <Route path="/sign-in">
                <Login onLogin={handleLogin} />
              </Route>
              <Route exact path="/">
                {loggedIn ? <Redirect to="/" /> : <Redirect to="/sign-in" />}
              </Route>
            </Switch>
            <Footer />
          </div>
        </div>

        <EditProfilePopup
          isOpen={isEditProfilePopupOpen}
          onClose={closeAllPopups}
          onUpdateUser={handleUpdateUser}
        />
        <EditAvatarPopup
          isOpen={isEditAvatarPopupOpen}
          onClose={closeAllPopups}
          onUpdateAvatar={handleUpdateAvatar}
        />
        <AddPlacePopup
          isOpen={isAddPlacePopupOpen}
          onClose={closeAllPopups}
          onAddPlace={handleAddPlaceSubmit}
        />
        {/* <PopupWithForm /> подтверждение удаления */}
        <ImagePopup card={selectedCard} onClose={closeAllPopups} />
        <InfoTooltip
          isOpen={isInfoTooltip}
          onClose={closeAllPopups}
          hint={infoStatus}
        />
      </>
    </CurrentUserContext.Provider>
  );
}

export default App;
