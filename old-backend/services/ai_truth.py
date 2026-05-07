import hashlib
import random
import uuid
import math
import json
import time
from datetime import datetime, timezone

def compute_sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def compute_perceptual_hash(data: bytes) -> str:
    """Simulate a perceptual hash based on file content sampling."""
    seed = int(hashlib.md5(data[:512] if len(data) > 512 else data).hexdigest(), 16)
    random.seed(seed)
    bits = [random.randint(0, 1) for _ in range(64)]
    return hex(int("".join(map(str, bits)), 2))[2:].zfill(16)

def generate_device_id() -> str:
    return "DEV-" + uuid.uuid4().hex[:12].upper()

class Block:
    def __init__(self, index, data, prev_hash):
        self.index = index
        self.timestamp = datetime.now(timezone.utc).isoformat()
        self.data = data
        self.prev_hash = prev_hash
        self.nonce = random.randint(10000, 99999)
        self.hash = self._compute_hash()

    def _compute_hash(self):
        content = f"{self.index}{self.timestamp}{json.dumps(self.data)}{self.prev_hash}{self.nonce}"
        return hashlib.sha256(content.encode()).hexdigest()

    def to_dict(self):
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "data": self.data,
            "prev_hash": self.prev_hash,
            "hash": self.hash,
            "nonce": self.nonce
        }

class Blockchain:
    def __init__(self):
        self.chain = [self._genesis()]
        self.merkle_roots = []

    def _genesis(self):
        return Block(0, {"type": "GENESIS", "message": "AI Truth Protocol — Origin Block"}, "0" * 64)

    def add_record(self, record: dict) -> Block:
        prev = self.chain[-1]
        block = Block(len(self.chain), record, prev.hash)
        self.chain.append(block)
        # Compute Merkle root for this batch
        hashes = [b.hash for b in self.chain[-min(4, len(self.chain)):]]
        while len(hashes) > 1:
            if len(hashes) % 2 != 0:
                hashes.append(hashes[-1])
            hashes = [hashlib.sha256((hashes[i] + hashes[i+1]).encode()).hexdigest()
                      for i in range(0, len(hashes), 2)]
        self.merkle_roots.append(hashes[0])
        return block

    def verify_chain(self):
        for i in range(1, len(self.chain)):
            if self.chain[i].prev_hash != self.chain[i-1].hash:
                return False
        return True

    def find_record(self, content_hash: str):
        for block in self.chain:
            if isinstance(block.data, dict) and block.data.get("content_hash") == content_hash:
                return block
        return None

class AIVerificationEngine:
    def analyze(self, file_bytes: bytes, filename: str) -> dict:
        file_hash = compute_sha256(file_bytes)
        file_size = len(file_bytes)
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "unknown"

        # Deterministic but varied scoring based on file content
        seed_val = int(file_hash[:8], 16)
        random.seed(seed_val)

        # Simulate individual model scores
        xception_score    = self._xception_analysis(file_bytes, seed_val)
        vit_score         = self._vit_analysis(file_bytes, seed_val)
        rppg_score        = self._rppg_analysis(file_bytes, seed_val, ext)
        temporal_score    = self._temporal_analysis(file_bytes, seed_val, ext)
        noise_score       = self._noise_pattern_analysis(file_bytes, seed_val)

        # Weighted ensemble
        weights = [0.30, 0.25, 0.20, 0.15, 0.10]
        scores  = [xception_score, vit_score, rppg_score, temporal_score, noise_score]
        ensemble = sum(w * s for w, s in zip(weights, scores))

        # Clamp
        ensemble = max(0.0, min(1.0, ensemble))

        # Risk factors
        risk_factors = []
        if xception_score < 0.5:
            risk_factors.append("Spatial artifacts detected in frequency domain")
        if vit_score < 0.5:
            risk_factors.append("Semantic inconsistencies in attention maps")
        if rppg_score < 0.5 and ext in ("mp4", "mov", "avi", "webm"):
            risk_factors.append("rPPG signal absent or irregular")
        if temporal_score < 0.5 and ext in ("mp4", "mov", "avi", "webm"):
            risk_factors.append("Temporal frame discontinuities found")
        if noise_score < 0.5:
            risk_factors.append("Non-natural noise patterns (GAN fingerprint suspected)")

        if ensemble >= 0.80:
            verdict = "AUTHENTIC"
            verdict_color = "green"
        elif ensemble >= 0.55:
            verdict = "LIKELY AUTHENTIC"
            verdict_color = "yellow"
        elif ensemble >= 0.35:
            verdict = "SUSPICIOUS"
            verdict_color = "orange"
        else:
            verdict = "SYNTHETIC / MANIPULATED"
            verdict_color = "red"

        return {
            "file_hash": file_hash,
            "perceptual_hash": compute_perceptual_hash(file_bytes),
            "file_size": file_size,
            "file_type": ext,
            "models": {
                "xception_cnn":         round(xception_score, 4),
                "vision_transformer":   round(vit_score, 4),
                "rppg_analyzer":        round(rppg_score, 4),
                "temporal_coherence":   round(temporal_score, 4),
                "noise_pattern_cnn":    round(noise_score, 4),
            },
            "ensemble_confidence": round(ensemble, 4),
            "verdict": verdict,
            "verdict_color": verdict_color,
            "risk_factors": risk_factors,
            "analysis_timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def _xception_score_from_bytes(self, data):
        sample = data[:4096] if len(data) > 4096 else data
        counts = [0] * 256
        for b in sample:
            counts[b] += 1
        n = len(sample)
        entropy = -sum((c/n) * math.log2(c/n) for c in counts if c > 0)
        normalized = (entropy - 6.5) / 1.5
        return max(0.0, min(1.0, normalized))

    def _xception_analysis(self, data, seed):
        base = self._xception_score_from_bytes(data)
        jitter = random.uniform(-0.12, 0.12)
        return max(0.0, min(1.0, base + jitter))

    def _vit_analysis(self, data, seed):
        base = self._xception_score_from_bytes(data)
        jitter = random.uniform(-0.15, 0.15)
        return max(0.0, min(1.0, base + 0.05 + jitter))

    def _rppg_analysis(self, data, seed, ext):
        if ext not in ("mp4", "mov", "avi", "webm", "mkv"):
            return random.uniform(0.60, 0.90)
        base = self._xception_score_from_bytes(data)
        jitter = random.uniform(-0.20, 0.20)
        return max(0.0, min(1.0, base + jitter))

    def _temporal_analysis(self, data, seed, ext):
        if ext not in ("mp4", "mov", "avi", "webm", "mkv"):
            return random.uniform(0.65, 0.92)
        base = self._xception_score_from_bytes(data)
        jitter = random.uniform(-0.18, 0.18)
        return max(0.0, min(1.0, base + jitter))

    def _noise_pattern_analysis(self, data, seed):
        base = self._xception_score_from_bytes(data)
        jitter = random.uniform(-0.10, 0.10)
        return max(0.0, min(1.0, base + jitter))

TRUSTED_DEVICES = {
    "DEV-ALPHA001": {"make": "Canon", "model": "EOS R5", "certified": True, "tee": True},
    "DEV-BETA002":  {"make": "Apple",  "model": "iPhone 15 Pro", "certified": True, "tee": True},
    "DEV-GAMMA003": {"make": "Sony",   "model": "A7 IV", "certified": True, "tee": True},
    "DEV-DELTA004": {"make": "Samsung","model": "Galaxy S24 Ultra", "certified": True, "tee": True},
    "DEV-UNKNOWN":  {"make": "Unknown","model": "Unknown", "certified": False, "tee": False},
}

# Global instances for the app service
blockchain = Blockchain()
ai_engine = AIVerificationEngine()
records_db = {}
