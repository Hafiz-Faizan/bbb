#!/bin/bash

# Install dependencies
apt-get update
apt-get install -y wget unzip

# Download and install Chromium
CHROME_VERSION="126.0.6478.182"
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
dpkg -i google-chrome-stable_current_amd64.deb || apt-get -fy install

# Verify installation
google-chrome --version
