from locust import HttpUser, task, between
import random

class VotingPlatformUser(HttpUser):
    wait_time = between(1, 3)

    @task(3)
    def fetch_elections(self):
        self.client.get("/api/voter/elections")

    @task(2)
    def verify_otp(self):
        self.client.post("/api/verify/otp", json={
            "email": "voter@example.com",
            "electionId": 1,
            "otpCode": "123456"
        })

    @task(1)
    def cast_vote_simulation(self):
        tx_hash = "0x" + "".join([random.choice("0123456789abcdef") for _ in range(64)])
        self.client.post("/api/voter/cast-vote", json={
            "electionId": 1,
            "candidateId": random.choice([1, 2]),
            "userId": random.randint(1, 100),
            "walletAddress": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
            "txHash": tx_hash,
            "blockNumber": 5928100
        })
