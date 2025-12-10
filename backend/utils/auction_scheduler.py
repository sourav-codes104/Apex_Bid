# utils/auction_scheduler.py
from datetime import datetime
from database import db
from models.auction import Auction

def refresh_auction_status(auction: Auction) -> Auction:
    """
    Correctly update auction status based on local server time (IST or system time):
    - upcoming -> live   (when start_time <= now < end_time)
    - live -> ended      (when now >= end_time)
    Commits only when a change happens.
    """

    if not auction:
        return None

    # ⭐ IMPORTANT: Use local time instead of UTC
    now = datetime.now()
    changed = False

    # Already ended → no need to evaluate again
    if auction.status == "ended":
        return auction

    # CASE 1 → LIVE
    if auction.start_time <= now < auction.end_time:
        if auction.status != "live":
            auction.status = "live"
            changed = True

    # CASE 2 → ENDED
    elif now >= auction.end_time:
        if auction.status != "ended":
            auction.status = "ended"
            changed = True

    # CASE 3 → UPCOMING
    elif now < auction.start_time:
        if auction.status != "upcoming":
            auction.status = "upcoming"
            changed = True

    # Commit only if status changed
    if changed:
        db.session.commit()

    return auction


def get_remaining_seconds(auction: Auction) -> int:
    """
    Return remaining seconds until auction ends.
    If auction is ended or invalid -> return 0.
    """

    if not auction:
        return 0

    now = datetime.now()   # ⭐ match local time

    if now >= auction.end_time:
        return 0

    return max(0, int((auction.end_time - now).total_seconds()))
