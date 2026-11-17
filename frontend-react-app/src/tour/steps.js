// src/tour/steps.js
//
// target:    value of a data-tour="..." attribute on the element to highlight (null = centered card)
// advanceOn: "click"  -> moves on when the highlighted element is clicked
//            "filled" -> moves on when the element with data-tour={watch} has a value
//            "button" -> popover shows a Next button
//            "none"   -> nothing advances it automatically (the app calls goToStep(...) instead)

export const TOUR_STEPS = [
  {
    id: "welcome",
    target: null,
    advanceOn: "button",
    title: "Welcome to EvoTivity",
    text: "This quick guide walks you through registering as a voter and connecting your wallet. It takes about two minutes.",
  },
  {
    id: "install-metamask",
    target: null,
    advanceOn: "button",
    title: "Get a MetaMask wallet first",
    text:
      "Install the MetaMask browser extension, create a wallet and write your recovery phrase down offline. " +
      "Then switch MetaMask to the Sepolia test network. You'll need a little free Sepolia ETH to pay gas when you vote.",
    link: { href: "https://metamask.io/download", label: "Get MetaMask" },
  },
  {
    id: "signup-details",
    target: "signup-details",
    advanceOn: "button",
    title: "Fill in your details",
    text: "Enter your full name, a username, your email, your National ID number and a password.",
  },
  {
    id: "connect-wallet",
    target: "connect-wallet",
    advanceOn: "filled",
    watch: "wallet-address",
    title: "Connect your wallet",
    text: "Click here and approve the connection in the MetaMask popup. The guide continues once your address appears.",
  },
  {
    id: "start-camera",
    target: "start-camera",
    advanceOn: "click",
    title: "Turn on your camera",
    text: "Click here and allow camera access. Your face scan is what we compare against when you vote.",
  },
  {
    id: "capture-face",
    target: "capture-face",
    advanceOn: "click",
    title: "Take your face photo",
    text: "Look straight at the camera in good light, then click here to capture your photo.",
  },
  {
    id: "register-submit",
    target: "register-submit",
    advanceOn: "none",
    title: "Create your account",
    text: "Click Register Account to finish. If something is missing, the form will tell you what.",
  },
  {
    id: "done",
    target: null,
    advanceOn: "button",
    title: "You're registered",
    text:
      "When an election is in the Voting phase, click Proceed to Voting Process on it. " +
      "You'll verify your wallet, your face and an email code, pick your candidate, then sign the vote in MetaMask.",
  },
];
