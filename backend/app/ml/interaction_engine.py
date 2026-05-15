from dataclasses import dataclass
from typing import List
from collections import Counter

@dataclass
class InteractionResult:
    drug_a:            str
    drug_b:            str
    shared_reactions:  List[str]
    risk_amplification:float   # how much worse the combo is vs each alone
    severity:          str     # "none" / "mild" / "moderate" / "severe"
    is_dangerous:      bool
    summary:           str

def compute_interaction(
    drug_a:      str,
    drug_b:      str,
    reactions_a: List[str],   # all reaction strings for drug A
    reactions_b: List[str],   # all reaction strings for drug B
    score_a:     float,
    score_b:     float,
) -> InteractionResult:
    """
    Detect interaction by finding overlapping adverse reactions.
    The more overlap + the higher individual scores, the more dangerous.
    """
    set_a = Counter(reactions_a)
    set_b = Counter(reactions_b)

    # Shared reactions between both drugs
    shared = [r for r in set_a if r in set_b]
    shared_sorted = sorted(shared, key=lambda r: set_a[r] + set_b[r], reverse=True)

    # Risk amplification: geometric mean of scores + overlap penalty
    overlap_ratio = len(shared) / max(len(set(reactions_a)), 1)
    base_risk     = (score_a + score_b) / 2
    amplification = round(base_risk * (1 + overlap_ratio * 0.5), 2)
    amplification = min(amplification, 100.0)

    # Severity classification
    if amplification >= 70 or len(shared) >= 5:
        severity     = "severe"
        is_dangerous = True
    elif amplification >= 45 or len(shared) >= 3:
        severity     = "moderate"
        is_dangerous = True
    elif amplification >= 20 or len(shared) >= 1:
        severity     = "mild"
        is_dangerous = False
    else:
        severity     = "none"
        is_dangerous = False

    # Build summary
    if not shared:
        summary = (
            f"{drug_a.capitalize()} and {drug_b.capitalize()} show no overlapping "
            f"adverse reactions in the FAERS database. "
            f"Combined risk score: {amplification}/100."
        )
    else:
        top3 = ', '.join(shared_sorted[:3])
        summary = (
            f"{drug_a.capitalize()} and {drug_b.capitalize()} share {len(shared)} "
            f"overlapping adverse reaction(s): {top3}. "
            f"Combined risk amplification score: {amplification}/100 ({severity}). "
            f"{'This combination warrants careful monitoring.' if is_dangerous else 'Exercise standard precaution.'}"
        )

    return InteractionResult(
        drug_a            = drug_a,
        drug_b            = drug_b,
        shared_reactions  = shared_sorted[:10],
        risk_amplification= amplification,
        severity          = severity,
        is_dangerous      = is_dangerous,
        summary           = summary,
    )
