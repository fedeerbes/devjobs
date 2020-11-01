const express = require("express");
const router = express.Router();

const routes = require("./routes");

const homeController = require("../controllers/homeController");
const openPositionsController = require("../controllers/openPositionsController");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

module.exports = () => {
  router.get("/", homeController.showJobs);

  // create open positions
  router.get(
    routes.NEW_OPEN_POSITION,
    authController.verifyUser,
    openPositionsController.newPositionForm
  );
  router.post(
    routes.NEW_OPEN_POSITION,
    authController.verifyUser,
    openPositionsController.validateOpenPosition,
    openPositionsController.addNewPosition
  );

  // show open position
  router.get(
    `${routes.OPEN_POSITIONS}/:url`,
    openPositionsController.showOpenPosition
  );

  // edit open position
  router.get(
    `${routes.EDIT_OPEN_POSITION}/:url`,
    authController.verifyUser,
    openPositionsController.editPositionForm
  );
  router.post(
    `${routes.EDIT_OPEN_POSITION}/:url`,
    authController.verifyUser,
    openPositionsController.validateOpenPosition,
    openPositionsController.editPosition
  );

  router.delete(
    `${routes.DELETE_OPEN_POSITION}/:id`,
    authController.verifyUser,
    openPositionsController.deleteOpenPosition
  );

  // create account
  router.get(routes.CREATE_ACCOUNT, userController.createAccountForm);
  router.post(
    routes.CREATE_ACCOUNT,
    userController.validateFields,
    userController.createAccount
  );

  // auth user
  router.get(routes.LOGIN, userController.loginForm);
  router.post(routes.LOGIN, authController.authUser);
  // logout
  router.get(routes.LOGOUT, authController.verifyUser, authController.logout);

  // reset password
  router.get(routes.RESET_PASSWORD, authController.formRestorePassword);
  router.post(routes.RESET_PASSWORD, authController.sendToken);

  router.get(`${routes.RESET_PASSWORD}/:token`, authController.resetPassword);
  router.post(`${routes.RESET_PASSWORD}/:token`, authController.savePassword);

  // admin panel
  router.get(
    routes.ADMIN,
    authController.verifyUser,
    authController.showAdminPanel
  );

  // edit profile
  router.get(
    routes.EDIT_PROFILE,
    authController.verifyUser,
    userController.editProfileForm
  );
  router.post(
    routes.EDIT_PROFILE,
    authController.verifyUser,
    // userController.validateProfile,
    userController.uploadImage,
    userController.editProfile
  );

  // receive candidates info
  router.post(
    `${routes.OPEN_POSITIONS}/:url`,
    openPositionsController.uploadCV,
    openPositionsController.addCandidate
  );

  // candidates
  router.get(
    `${routes.CANDIDATES}/:id`,
    authController.verifyUser,
    openPositionsController.showCandidates
  );

  // search
  router.post(routes.SEARCH, openPositionsController.search);

  return router;
};
