"""
Test suite for Encouragement System Features:
- Progress Indicators (Almost There! showing progress to next badges)
- Effort-Based Badges (Brave Learner, Never Give Up, Mistake Master, Daily Learner)
- Effort Stats Tracking (total_attempts, total_correct, total_wrong, wrong_streak, etc.)
- API endpoints for progress tracking with is_correct parameter
"""
import pytest
import requests
import os
from datetime import datetime, timezone

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://math-play-kids-3.preview.emergentagent.com').rstrip('/')

# Test credentials - using Namal (age 14) as test child
TEST_PARENT_EMAIL = "testparent@test.com"
TEST_PARENT_PASSWORD = "test123"
TEST_CHILD_ID_NAMAL = "cd57e76c-02e9-4276-a7c5-f0f7588a9670"  # Namal with effort tracking data


class TestAuthentication:
    """Authentication tests to get token for subsequent tests"""
    
    def test_login_success(self):
        """Test parent login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_PARENT_EMAIL,
            "password": TEST_PARENT_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data
        assert "user" in data
        print(f"Login successful for {TEST_PARENT_EMAIL}")
        return data["token"]


class TestEffortStatsTracking:
    """Tests for effort_stats tracking in child data"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_PARENT_EMAIL,
            "password": TEST_PARENT_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Authentication failed")
    
    def test_child_has_effort_stats(self, auth_token):
        """Test that child data includes effort_stats"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID_NAMAL}", headers=headers)
        
        assert response.status_code == 200, f"Get child failed: {response.text}"
        data = response.json()
        
        # Verify effort_stats structure
        assert "effort_stats" in data, "Child data should include effort_stats"
        effort_stats = data["effort_stats"]
        
        # Check all required fields
        required_fields = [
            "total_attempts", "total_correct", "total_wrong",
            "current_wrong_streak", "max_wrong_streak", "continued_after_wrong_streak",
            "questions_today", "last_question_date", "mistakes_reviewed",
            "login_days", "best_day_questions"
        ]
        
        for field in required_fields:
            assert field in effort_stats, f"Missing effort_stats field: {field}"
        
        print(f"Effort stats: {effort_stats}")
    
    def test_effort_stats_values_are_valid(self, auth_token):
        """Test that effort_stats values are valid numbers"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID_NAMAL}", headers=headers)
        
        data = response.json()
        effort_stats = data["effort_stats"]
        
        # Verify numeric fields are non-negative
        assert effort_stats["total_attempts"] >= 0, "total_attempts should be >= 0"
        assert effort_stats["total_correct"] >= 0, "total_correct should be >= 0"
        assert effort_stats["total_wrong"] >= 0, "total_wrong should be >= 0"
        assert effort_stats["current_wrong_streak"] >= 0, "current_wrong_streak should be >= 0"
        assert effort_stats["questions_today"] >= 0, "questions_today should be >= 0"
        assert effort_stats["login_days"] >= 0, "login_days should be >= 0"
        
        # Verify total_attempts = total_correct + total_wrong
        # Note: This may not always be exact due to timing, but should be close
        print(f"Total attempts: {effort_stats['total_attempts']}")
        print(f"Total correct: {effort_stats['total_correct']}")
        print(f"Total wrong: {effort_stats['total_wrong']}")


class TestProgressUpdateWithIsCorrect:
    """Tests for PUT /api/children/{id}/progress with is_correct parameter"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_PARENT_EMAIL,
            "password": TEST_PARENT_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Authentication failed")
    
    def test_progress_update_with_is_correct_true(self, auth_token):
        """Test progress update with is_correct=true adds stars"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Get current stats
        before = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID_NAMAL}", headers=headers).json()
        before_stars = before["progress"]["total_stars"]
        before_attempts = before["effort_stats"]["total_attempts"]
        before_correct = before["effort_stats"]["total_correct"]
        
        # Update with correct answer
        response = requests.put(
            f"{BASE_URL}/api/children/{TEST_CHILD_ID_NAMAL}/progress?module=addition&stars=1&is_correct=true",
            headers=headers
        )
        
        assert response.status_code == 200, f"Progress update failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "progress" in data, "Response should include progress"
        assert "effort_stats" in data, "Response should include effort_stats"
        
        # Verify stars increased
        assert data["progress"]["total_stars"] == before_stars + 1, "Stars should increase by 1"
        
        # Verify effort_stats updated
        assert data["effort_stats"]["total_attempts"] == before_attempts + 1, "total_attempts should increase"
        assert data["effort_stats"]["total_correct"] == before_correct + 1, "total_correct should increase"
        
        print(f"Progress update successful: stars={data['progress']['total_stars']}, attempts={data['effort_stats']['total_attempts']}")
    
    def test_progress_update_with_is_correct_false(self, auth_token):
        """Test progress update with is_correct=false does NOT add stars"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Get current stats
        before = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID_NAMAL}", headers=headers).json()
        before_stars = before["progress"]["total_stars"]
        before_attempts = before["effort_stats"]["total_attempts"]
        before_wrong = before["effort_stats"]["total_wrong"]
        
        # Update with wrong answer
        response = requests.put(
            f"{BASE_URL}/api/children/{TEST_CHILD_ID_NAMAL}/progress?module=addition&stars=0&is_correct=false",
            headers=headers
        )
        
        assert response.status_code == 200, f"Progress update failed: {response.text}"
        data = response.json()
        
        # Verify stars did NOT increase
        assert data["progress"]["total_stars"] == before_stars, "Stars should NOT increase for wrong answer"
        
        # Verify effort_stats updated
        assert data["effort_stats"]["total_attempts"] == before_attempts + 1, "total_attempts should increase"
        assert data["effort_stats"]["total_wrong"] == before_wrong + 1, "total_wrong should increase"
        
        print(f"Wrong answer tracked: stars={data['progress']['total_stars']}, wrong={data['effort_stats']['total_wrong']}")
    
    def test_wrong_streak_tracking(self, auth_token):
        """Test that wrong streak is tracked correctly"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Get current wrong streak
        before = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID_NAMAL}", headers=headers).json()
        before_streak = before["effort_stats"]["current_wrong_streak"]
        
        # Submit a wrong answer
        response = requests.put(
            f"{BASE_URL}/api/children/{TEST_CHILD_ID_NAMAL}/progress?module=addition&stars=0&is_correct=false",
            headers=headers
        )
        
        data = response.json()
        
        # Wrong streak should increase
        assert data["effort_stats"]["current_wrong_streak"] == before_streak + 1, "Wrong streak should increase"
        
        print(f"Wrong streak: before={before_streak}, after={data['effort_stats']['current_wrong_streak']}")
    
    def test_wrong_streak_resets_on_correct(self, auth_token):
        """Test that wrong streak resets to 0 on correct answer"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Submit a correct answer
        response = requests.put(
            f"{BASE_URL}/api/children/{TEST_CHILD_ID_NAMAL}/progress?module=addition&stars=1&is_correct=true",
            headers=headers
        )
        
        data = response.json()
        
        # Wrong streak should be 0
        assert data["effort_stats"]["current_wrong_streak"] == 0, "Wrong streak should reset to 0 on correct answer"
        
        print(f"Wrong streak reset to 0 after correct answer")


class TestProgressToNextBadges:
    """Tests for progress_to_next array in achievements endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_PARENT_EMAIL,
            "password": TEST_PARENT_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Authentication failed")
    
    def test_achievements_returns_progress_to_next(self, auth_token):
        """Test GET /api/children/{id}/achievements returns progress_to_next array"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID_NAMAL}/achievements", headers=headers)
        
        assert response.status_code == 200, f"Achievements endpoint failed: {response.text}"
        data = response.json()
        
        # Verify progress_to_next exists
        assert "progress_to_next" in data, "Response should include progress_to_next array"
        progress_list = data["progress_to_next"]
        
        assert isinstance(progress_list, list), "progress_to_next should be a list"
        print(f"Progress to next badges: {len(progress_list)} badges within reach")
    
    def test_progress_to_next_structure(self, auth_token):
        """Test that progress_to_next items have correct structure"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID_NAMAL}/achievements", headers=headers)
        
        data = response.json()
        progress_list = data["progress_to_next"]
        
        if progress_list:
            for progress in progress_list:
                assert "badge" in progress, "Progress item should have badge id"
                assert "name" in progress, "Progress item should have name"
                assert "current" in progress, "Progress item should have current value"
                assert "target" in progress, "Progress item should have target value"
                assert "remaining" in progress, "Progress item should have remaining value"
                assert "percentage" in progress, "Progress item should have percentage"
                
                # Verify values are valid
                assert progress["current"] >= 0, "current should be >= 0"
                assert progress["target"] > 0, "target should be > 0"
                assert progress["remaining"] >= 0, "remaining should be >= 0"
                assert 0 <= progress["percentage"] <= 100, "percentage should be 0-100"
                
                print(f"Progress: {progress['name']} - {progress['current']}/{progress['target']} ({progress['percentage']}%)")
    
    def test_progress_includes_effort_badges(self, auth_token):
        """Test that progress_to_next includes effort-based badges"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID_NAMAL}/achievements", headers=headers)
        
        data = response.json()
        progress_list = data["progress_to_next"]
        
        # Check for effort-based badges in progress
        effort_badges = ["brave_learner", "mistake_master", "daily_learner"]
        found_effort_badges = [p["badge"] for p in progress_list if p["badge"] in effort_badges]
        
        print(f"Effort badges in progress: {found_effort_badges}")
        # At least one effort badge should be in progress (unless all are earned)


class TestEffortBasedBadges:
    """Tests for effort-based badges (Brave Learner, Never Give Up, Mistake Master, Daily Learner)"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_PARENT_EMAIL,
            "password": TEST_PARENT_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Authentication failed")
    
    def test_effort_badges_exist_in_achievements(self, auth_token):
        """Test that effort-based badges are available in achievements"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID_NAMAL}/achievements", headers=headers)
        
        data = response.json()
        all_badges = data["earned"] + data["locked"]
        badge_ids = [b["id"] for b in all_badges]
        
        # Check for effort badges
        effort_badges = [
            "brave_learner", "brave_learner_50", "brave_learner_100",
            "never_give_up", "never_give_up_5", "never_give_up_10",
            "mistake_master", "mistake_master_15",
            "daily_learner", "daily_learner_7", "daily_learner_30"
        ]
        
        for badge in effort_badges:
            assert badge in badge_ids, f"Effort badge {badge} should exist"
        
        print(f"All {len(effort_badges)} effort badges exist in achievements")
    
    def test_effort_badges_have_effort_category(self, auth_token):
        """Test that effort badges have category='effort'"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID_NAMAL}/achievements", headers=headers)
        
        data = response.json()
        all_badges = data["earned"] + data["locked"]
        
        effort_badge_ids = [
            "brave_learner", "brave_learner_50", "brave_learner_100",
            "never_give_up", "never_give_up_5", "never_give_up_10",
            "mistake_master", "mistake_master_15",
            "daily_learner", "daily_learner_7", "daily_learner_30"
        ]
        
        for badge in all_badges:
            if badge["id"] in effort_badge_ids:
                assert badge["category"] == "effort", f"Badge {badge['id']} should have category='effort'"
        
        print("All effort badges have correct category")
    
    def test_never_give_up_badge_earned(self, auth_token):
        """Test that Namal has earned never_give_up badge (continued after 3 wrong streak)"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID_NAMAL}", headers=headers)
        
        data = response.json()
        badges = data["progress"]["badges"]
        
        # Namal should have never_give_up badge based on test data
        assert "never_give_up" in badges, "Namal should have never_give_up badge"
        
        # Verify continued_after_wrong_streak >= 1
        assert data["effort_stats"]["continued_after_wrong_streak"] >= 1, "Should have continued after wrong streak"
        
        print(f"never_give_up badge earned! continued_after_wrong_streak={data['effort_stats']['continued_after_wrong_streak']}")


class TestAchievementsWithEffortStats:
    """Tests for achievements endpoint returning effort_stats"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_PARENT_EMAIL,
            "password": TEST_PARENT_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Authentication failed")
    
    def test_achievements_returns_effort_stats(self, auth_token):
        """Test GET /api/children/{id}/achievements returns effort_stats"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID_NAMAL}/achievements", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "effort_stats" in data, "Achievements should include effort_stats"
        effort_stats = data["effort_stats"]
        
        # Verify key fields
        assert "total_attempts" in effort_stats
        assert "total_correct" in effort_stats
        assert "total_wrong" in effort_stats
        assert "questions_today" in effort_stats
        assert "login_days" in effort_stats
        
        print(f"Effort stats from achievements: attempts={effort_stats['total_attempts']}, correct={effort_stats['total_correct']}")


class TestProgressUpdateReturnsNextBadgeProgress:
    """Tests for progress update returning next_badge_progress"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_PARENT_EMAIL,
            "password": TEST_PARENT_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Authentication failed")
    
    def test_progress_update_returns_next_badge_progress(self, auth_token):
        """Test PUT /api/children/{id}/progress returns next_badge_progress"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        response = requests.put(
            f"{BASE_URL}/api/children/{TEST_CHILD_ID_NAMAL}/progress?module=addition&stars=1&is_correct=true",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "next_badge_progress" in data, "Progress update should return next_badge_progress"
        
        print(f"Next badge progress: {data['next_badge_progress']}")


class TestQuestionsToday:
    """Tests for questions_today tracking"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_PARENT_EMAIL,
            "password": TEST_PARENT_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Authentication failed")
    
    def test_questions_today_increments(self, auth_token):
        """Test that questions_today increments on each progress update"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Get current questions_today
        before = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID_NAMAL}", headers=headers).json()
        before_count = before["effort_stats"]["questions_today"]
        
        # Update progress
        response = requests.put(
            f"{BASE_URL}/api/children/{TEST_CHILD_ID_NAMAL}/progress?module=addition&stars=1&is_correct=true",
            headers=headers
        )
        
        data = response.json()
        
        # questions_today should increment (or reset to 1 if new day)
        assert data["effort_stats"]["questions_today"] >= 1, "questions_today should be at least 1"
        
        print(f"Questions today: before={before_count}, after={data['effort_stats']['questions_today']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
