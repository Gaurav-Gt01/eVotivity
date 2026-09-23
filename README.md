# 🗳️ EvoTivity (eVoteVerity) - Decentralized Blockchain Voting Platform

[![Blockchain](https://img.shields.io/badge/Blockchain-Ethereum%20Sepolia-blue?logo=ethereum)](https://sepolia.etherscan.io/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green?logo=nodedotjs)](https://expressjs.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61DAFB?logo=react)](https://reactjs.org/)
[![AI Biometrics](https://img.shields.io/badge/AI%20Biometrics-Python%20DeepFace%20%7C%20OpenCV-3776AB?logo=python)](https://python.org/)
[![Database](https://img.shields.io/badge/Database-MySQL%20%7C%20Redis-4479A1?logo=mysql)](https://mysql.com/)

EvoTivity is a decentralized, tamper-resistant digital voting platform built with **Triple Authentication Security** (MetaMask Wallet + Python DeepFace AI Biometrics + Email OTP) and a **Multi-Election Smart Contract Architecture** using the Factory Pattern on Ethereum Sepolia.

---

## System Architecture

```
[ User / Internet ] ---> [ WAF / Ingress ]
                               |
                               v
               +-------------------------------+
               |      KUBERNETES CLUSTER       |
               |                               |
               |  [ API Gateway ]              |
               |         |                     |
               |         v                     |
               |  [ App Server Pods ]          |
               |         |                     |
               |         v                     |
               |  [ Web Server Pods ]          |
               |      /         \              |
               |     v           v             |
               | [Redis]      [Kafka]          |
               +---|-------------|-------------+
                   |             |
                   v             v
        [ Primary MySQL DB ] <---+
        [ + Read Replicas  ]
                   |
                   v
        [ Blockchain Layer ] ---> [ Ethereum Sepolia / Peer Validator Nodes ]
```

---

## 👥 Monorepo Microservices Division (4 Team Members)


## 🔐 Core Security & 5-Step Guided Voting Workflow

1. **Step 1: MetaMask Wallet Authentication** — Identity verification linking unique voter wallet addresses per election directly on Sepolia.
2. **Step 2: Python DeepFace Facial AI Verification** — Real-time webcam snapshot capturing & biometric embedding comparison via Python Flask microservice.
3. **Step 3: Email OTP Verification** — Time-bound 6-digit one-time passcode verification.
4. **Step 4: Candidate Ballot Selection** — Interactive candidate card ballot with party logos and bio selection.
5. **Step 5: Blockchain Smart Contract Transaction** — MetaMask Web3 transaction signing executing `vote(candidateId)` on `Election.sol` with transaction hash generation, block receipt, and direct Etherscan link verification.

---

## 🛠️ Quick Start Guide

### Prerequisites
- Node.js `v18+`
- Python `v3.10+`
- MetaMask browser extension

### Running via Microservices

```bash
# 1. Start Python DeepFace Microservice (Port 5000)
cd face-ai-service
source venv/bin/activate
python app.py

# 2. Start Node.js Express Backend API (Port 5001)
cd backend-api-service
npm run dev

# 3. Start React Frontend SPA (Port 3000)
cd frontend-react-app
npm run dev
```

### Running via Docker Compose

```bash
docker-compose up --build
```

---

## 📜 License & Acknowledgments
Built with ❤️ by Team EvoTivity. Open-source under the [MIT License](LICENSE).
