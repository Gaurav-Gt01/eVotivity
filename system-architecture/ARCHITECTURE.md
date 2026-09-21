# EvoTivity Enterprise High-Availability System Architecture

## Architectural Overview

EvoTivity is designed for enterprise-grade scalability, concurrency, fault tolerance, and zero-downtime voting operations.

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

## Key Infrastructure Components

1. **WAF & API Gateway**: Filters malicious requests, enforces SSL termination, rate limits IP requests, and balances incoming traffic to Kubernetes pods.
2. **App & Web Server Pods**: Auto-scaled Kubernetes deployments running Node.js Express REST API backend nodes.
3. **Redis Cluster**: Caches active election state, session tokens, OTP verification keys, and real-time vote count tallies.
4. **Kafka Queue**: Asynchronously queues high-throughput concurrent vote transaction requests to prevent database write bottlenecks.
5. **Primary MySQL Database + Read Replicas**: Primary database handles transactional writes (voter registration, approval records) while read replicas serve public status queries.
6. **Ethereum Sepolia Blockchain**: Smart contracts (`ElectionFactory.sol`, `Election.sol`) act as the immutable ledger for final vote count verification.
