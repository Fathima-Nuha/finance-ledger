# Finance Ledger

A personal finance tracking app built with React. Track your monthly salary, set category spending limits, log expenses, and stay on top of your budget.

---

## Features

### Salary & Balance Sync
When the user sets their monthly salary for the first time and no spending has been recorded yet, the total balance is automatically updated to match the salary amount. This means users always start with an accurate picture of what they have available without having to enter their balance separately.

### Category Management
Users can create new spending categories with a single button press. Each category is given a default name, description, and a spending limit of zero. The name auto-increments so multiple categories can be added quickly. When a category's spending limit is updated and nothing has been spent from it yet, the available balance for that category is kept in sync with the new limit automatically.

### Spending Tracker
When a user logs a spend against a category, the amount is deducted from both the category's remaining balance and the overall total balance. A new transaction record is created immediately, showing the category name, amount, time, and a colour-coded icon, and it appears at the top of the Recent Activity list.

### Inline Editing
Category names, descriptions, and spending limits can all be edited directly in the list without navigating away. Clicking the pencil icon activates an input field. The change is confirmed by pressing Enter or clicking elsewhere, and cancelled by pressing Escape. There are no separate save or cancel buttons, keeping the interface clean.

### First-Time Onboarding Tour
A spotlight-based guided tour runs automatically the first time a user opens the app. It walks through five steps — setting a salary, viewing the balance, creating a category, setting a spending limit, and logging a spend — by highlighting each relevant element on screen with a focused cutout. Once the user completes or dismisses the tour, a flag is saved to local storage so the tour never appears again on future visits.

---

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

---

*This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).*

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
