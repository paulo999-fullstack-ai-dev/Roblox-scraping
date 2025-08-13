#!/usr/bin/env python3
"""
Test performance improvement of fast analytics vs old analytics
"""
import time
from sqlalchemy.orm import Session
from database import SessionLocal
from analytics import get_analytics_summary as old_summary
from analytics_fast import get_fast_analytics_summary as new_summary
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_performance():
    """Test performance of old vs new analytics"""
    db = SessionLocal()
    
    try:
        logger.info("Testing Analytics Performance...")
        logger.info("=" * 50)
        
        # Test old analytics
        logger.info("Testing OLD analytics...")
        start_time = time.time()
        try:
            old_result = old_summary(db)
            old_time = time.time() - start_time
            logger.info(f"✅ OLD analytics completed in {old_time:.3f} seconds")
            logger.info(f"   Result: {old_result}")
        except Exception as e:
            old_time = float('inf')
            logger.error(f"❌ OLD analytics failed: {e}")
        
        # Test new analytics
        logger.info("\nTesting NEW fast analytics...")
        start_time = time.time()
        try:
            new_result = new_summary(db)
            new_time = time.time() - start_time
            logger.info(f"✅ NEW analytics completed in {new_time:.3f} seconds")
            logger.info(f"   Result: {new_result}")
        except Exception as e:
            new_time = float('inf')
            logger.error(f"❌ NEW analytics failed: {e}")
        
        # Performance comparison
        logger.info("\n" + "=" * 50)
        if old_time != float('inf') and new_time != float('inf'):
            speedup = old_time / new_time
            logger.info(f"🚀 PERFORMANCE IMPROVEMENT:")
            logger.info(f"   Old time: {old_time:.3f}s")
            logger.info(f"   New time: {new_time:.3f}s")
            logger.info(f"   Speedup: {speedup:.1f}x faster!")
            
            if speedup > 10:
                logger.info("   🎉 EXCELLENT! More than 10x faster!")
            elif speedup > 5:
                logger.info("   🚀 GREAT! More than 5x faster!")
            elif speedup > 2:
                logger.info("   👍 GOOD! More than 2x faster!")
            else:
                logger.info("   ⚠️  Minimal improvement")
        else:
            logger.info("❌ Could not compare performance due to errors")
            
    finally:
        db.close()

if __name__ == "__main__":
    test_performance() 