# Domain and Endpoint Tester

This Node.js script reads a list of domains and endpoints from files, makes HTTP requests to each combination of domain and endpoint, and summarizes the results. It uses `axios` for HTTP requests and `async` for concurrency control.

---

## Table of Contents

1. [Installation](#installation)
2. [Running Tests](#running-tests)
3. [Executing the Script](#executing-the-script)
4. [Results](#results)

---

## Installation

To install the required dependencies, run the following command from the root of the project:

```bash
npm install
```

## Running Tests

To run the tests:

```bash
npm run test
```

## Executing the Script

To execute the script and get the results, navigate to the src directory and run:

```bash
node index.js
```

## Results

Results for https://snyk.io:
  Status codes:
    200: 5
    404: 6
    401: 1
  Valid paths:
    https://snyk.io/
    https://snyk.io/login
    https://snyk.io/admin
    https://snyk.io/robots.txt
    https://snyk.io/wp-admin

Results for https://example.com:
  Status codes:
    200: 1
    404: 11
  Valid paths:
    https://example.com/

Results for https://plus.probely.app:
  Status codes:
    200: 9
    404: 3
  Valid paths:
    https://plus.probely.app/
    https://plus.probely.app/login
    https://plus.probely.app/admin
    https://plus.probely.app/dashboard
    https://plus.probely.app/backoffice
    https://plus.probely.app/api
    https://plus.probely.app/wp-admin
    https://plus.probely.app/search
    https://plus.probely.app/sitemap.xml

Results for https://secret.probely.com:
  Status codes:
    -1: 12
  Valid paths:

Results for https://wordpress.org:
  Status codes:
    200: 9
    404: 3
  Valid paths:
    https://wordpress.org/
    https://wordpress.org/login
    https://wordpress.org/admin
    https://wordpress.org/search
    https://wordpress.org/robots.txt
    https://wordpress.org/dashboard
    https://wordpress.org/wp-admin
    https://wordpress.org/.well-known/security.txt
    https://wordpress.org/sitemap.xml

Results for https://www.google.com:
  Status codes:
    404: 5
    200: 7
  Valid paths:
    https://www.google.com/
    https://www.google.com/robots.txt
    https://www.google.com/humans.txt
    https://www.google.com/sitemap.xml
    https://www.google.com/.well-known/security.txt
    https://www.google.com/search
    https://www.google.com/dashboard

Results for https://www.microsoft.com:
  Status codes:
    200: 4
    404: 7
    403: 1
  Valid paths:
    https://www.microsoft.com/
    https://www.microsoft.com/robots.txt
    https://www.microsoft.com/.well-known/security.txt
    https://www.microsoft.com/sitemap.xml

Summary:
  Total domains tested: 7
  Total paths tested: 84
