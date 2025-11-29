# easyMoney

easyMoney is a personal finance app designed to help you track your expenses and manage your budget effectively. It provides a simple and intuitive interface to help you keep track of how you're spending your monthly income. It was inspired by the visual budget that Caleb Hammer creates for people that appear on Financial Audit. To me, this project is largely complete but if there is something you'd like to see added, please open an issue or submit a pull request.

[Check out the live demo! (resets every hour)](https://easymoney-demo.pages.dev)

## Disclaimer

easyMoney was written in Google's Antigravity IDE, utilizing a mix of Gemini 3 Pro and Sonnet 4.5. 

## Screenshots

![Dashboard Screenshot](/path/to/dashboard_screenshot.png)

![Expense Entry Screenshot](/path/to/expense_screenshot.png)

## Features

*   Visual representation of how your money is being spent
*   Expense tracking by category or line item
*   Quickly disable specific expenses to experiment with changes in your bills
*   Mobile and desktop views
*   Progressive Web App (PWA)
*   Self-hosted
*   Cool Tokyo theme :D

## What it doesn't do

* Track small spending - it's not intended to make you feel guilty about gas station taquitos or your morning coffee run.
* Track unplanned, yearly or other expenses
* Build a history of your income or spending - there are other apps for that.
* No user authentication - this is meant to be used by a family or small set of people you trust.

## Deployment

You can deploy easyMoney using the pre-built Docker image.

```bash
docker run -d \
  -p 3186:3186 \
  -v $(pwd)/data:/app/data \
  --name easymoney \
  --restart unless-stopped \
  calrock/easymoney:latest
```

or using the docker-compose.yml file:

```bash
docker compose up -d
```