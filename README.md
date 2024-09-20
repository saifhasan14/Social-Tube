# SocialTube: A Next-Gen Video Sharing Platform Along With Social Media

Deployed link - https://social-tube.vercel.app/

Welcome to SocialTube! This platform revolutionizes how users interact with video content by integrating advanced rating systems, direct user interactions, tweet-like posts, and robust admin tools for maintaining content quality.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup and Installation](#setup-and-installation)
- [Usage](#usage)
  - [User Functions](#user-functions)
  - [Admin Controls](#admin-controls)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Video Sharing**: Upload and share videos with the community.
- **Advanced Rating System**: Users can rate videos on a scale of 1-10. Videos with ratings below 3.0 and more than 500 ratings are flagged for admin review.
- **User Interaction**: Comment on videos, rate content, and interact with other users.
- **Karma Points**: A system similar to Reddit to gauge user credibility and reliability.
- **Tweet-Like Posts**: Users can make short, tweet-like posts to engage with their audience.
- **Admin Tools**: Administrators can review flagged videos and take them down if necessary.

## Technologies Used

- **Frontend**: React, Redux, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Background Jobs**: `node-cron`
- **Notifications**: Custom notification system
- **Utilities**: Axios, React-hot-toast, Mongoose

## Setup and Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/saifhasan14/SocialTube.git
   cd SocialTube
2. **Install Dependencies**:
    ```bash
    Copy code
    npm install
    cd client
    npm install
    cd ..
3. **Environment Variables**:

    Create a .env file in the root directory with the following variables:

    **makefile**
    ```bash
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret

4. **Run the Development Server**:
    ```bash
    Copy code
    npm run dev
    cd client
    npm start

5. **Build for Production**:
    ```bash
    Copy code
    npm run build
    cd client
    npm run build


## Usage
### User Functions
- **Sign Up/Login**: Users can create an account or log in to an existing one.
- **Upload Videos**: Upload videos and share them with the community.
- **Rate Videos**: Rate videos on a scale of 1-10. Your rating contributes to the overall score of the video.
- **Post Comments**: Engage with other users by commenting on videos.
- **Make Posts**: Create tweet-like posts to interact with your followers.

### Admin Controls

- **Review Flagged Videos**: Videos with an average rating below 3.0 and more than 500 ratings are flagged for admin review.
- **Notifications**: Admins receive notifications about flagged videos.
- **Take Down Videos**: Admins can review flagged videos and decide to take them down if necessary.


## Contributing
We welcome contributions from the community! To contribute, please follow these steps:

1. **Fork the repository**.
2. **Create a new branch**: git checkout -b my-feature-branch.
3. **Make your changes and commit them**: git commit -m 'Add new feature'.
4. **Push to the branch**: git push origin my-feature-branch.
5. **Create a Pull Request**: Explain your changes and submit the pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

### We hope you enjoy using SocialTube as much as we enjoyed building it! If you have any questions, feel free to open an issue or reach out to us. Happy sharing!
