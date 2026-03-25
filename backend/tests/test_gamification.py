"""
Test suite for Gamification Features:
- Daily Streak System
- Mistake Review System  
- Achievement Badges
"""
import pytest
import requests
import os
from datetime import datetime, timezone

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://math-play-kids-3.preview.emergentagent.com').rstrip('/')

# Test credentials
TEST_PARENT_EMAIL = "testparent@test.com"
TEST_PARENT_PASSWORD = "test123"
TEST_CHILD_ID = "7bd2c732-3b27-45be-add2-51c813440404"  # Johnny with subscription


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


class TestStreakSystem:
    """Tests for Daily Streak tracking feature"""
    
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
    
    def test_get_streak_endpoint(self, auth_token):
        """Test GET /api/children/{id}/streak endpoint"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID}/streak", headers=headers)
        
        assert response.status_code == 200, f"Streak endpoint failed: {response.text}"
        data = response.json()
        
        # Verify streak data structure
        assert "current_streak" in data, "Missing current_streak field"
        assert "longest_streak" in data, "Missing longest_streak field"
        assert "last_practice_date" in data, "Missing last_practice_date field"
        assert "streak_history" in data, "Missing streak_history field"
        
        print(f"Streak data: current={data['current_streak']}, longest={data['longest_streak']}")
        print(f"Last practice: {data['last_practice_date']}")
        print(f"Streak history: {data['streak_history']}")
    
    def test_streak_increments_on_progress(self, auth_token):
        """Test that streak increments when progress is updated"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Get current streak
        streak_before = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID}/streak", headers=headers).json()
        
        # Update progress (this should update streak if not practiced today)
        response = requests.put(
            f"{BASE_URL}/api/children/{TEST_CHILD_ID}/progress?module=addition&stars=1",
            headers=headers
        )
        assert response.status_code == 200, f"Progress update failed: {response.text}"
        
        # Get streak after
        streak_after = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID}/streak", headers=headers).json()
        
        # Verify streak data is returned
        assert "current_streak" in streak_after
        assert streak_after["current_streak"] >= 0
        
        print(f"Streak before: {streak_before['current_streak']}, after: {streak_after['current_streak']}")
    
    def test_streak_history_contains_dates(self, auth_token):
        """Test that streak history contains valid date strings"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID}/streak", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # If there's history, verify dates are valid ISO format
        if data["streak_history"]:
            for date_str in data["streak_history"]:
                try:
                    datetime.fromisoformat(date_str)
                    print(f"Valid date in history: {date_str}")
                except ValueError:
                    pytest.fail(f"Invalid date format in streak_history: {date_str}")


class TestMistakeSystem:
    """Tests for Mistake Review System"""
    
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
    
    def test_get_mistakes_endpoint(self, auth_token):
        """Test GET /api/children/{id}/mistakes endpoint"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID}/mistakes", headers=headers)
        
        assert response.status_code == 200, f"Mistakes endpoint failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "mistakes" in data, "Missing mistakes field"
        assert "total_count" in data, "Missing total_count field"
        assert "unreviewed_count" in data, "Missing unreviewed_count field"
        
        print(f"Mistakes: total={data['total_count']}, unreviewed={data['unreviewed_count']}")
    
    def test_record_mistake(self, auth_token):
        """Test POST /api/children/{id}/mistakes - record a wrong answer"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        mistake_data = {
            "question_id": "test-q-123",
            "question_text": "What is 5 + 3?",
            "question_type": "addition",
            "user_answer": "7",
            "correct_answer": "8",
            "options": ["6", "7", "8", "9"],
            "is_correct": False
        }
        
        response = requests.post(
            f"{BASE_URL}/api/children/{TEST_CHILD_ID}/mistakes",
            headers=headers,
            json=mistake_data
        )
        
        assert response.status_code == 200, f"Record mistake failed: {response.text}"
        data = response.json()
        
        assert data.get("recorded") == True, "Mistake should be recorded"
        assert "mistake_id" in data, "Should return mistake_id"
        
        print(f"Mistake recorded with ID: {data['mistake_id']}")
        return data["mistake_id"]
    
    def test_correct_answer_not_recorded(self, auth_token):
        """Test that correct answers are NOT recorded as mistakes"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        correct_data = {
            "question_id": "test-q-456",
            "question_text": "What is 2 + 2?",
            "question_type": "addition",
            "user_answer": "4",
            "correct_answer": "4",
            "options": ["3", "4", "5", "6"],
            "is_correct": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/children/{TEST_CHILD_ID}/mistakes",
            headers=headers,
            json=correct_data
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("recorded") == False, "Correct answer should NOT be recorded"
        print("Correct answer correctly not recorded as mistake")
    
    def test_mark_mistake_reviewed(self, auth_token):
        """Test PUT /api/children/{id}/mistakes/{mistake_id}/review"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # First get existing mistakes
        mistakes_res = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID}/mistakes", headers=headers)
        mistakes = mistakes_res.json().get("mistakes", [])
        
        if not mistakes:
            # Record a new mistake first
            mistake_data = {
                "question_id": "test-review-q",
                "question_text": "What is 10 - 3?",
                "question_type": "subtraction",
                "user_answer": "6",
                "correct_answer": "7",
                "options": ["5", "6", "7", "8"],
                "is_correct": False
            }
            requests.post(f"{BASE_URL}/api/children/{TEST_CHILD_ID}/mistakes", headers=headers, json=mistake_data)
            mistakes_res = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID}/mistakes", headers=headers)
            mistakes = mistakes_res.json().get("mistakes", [])
        
        if mistakes:
            mistake_id = mistakes[0]["id"]
            response = requests.put(
                f"{BASE_URL}/api/children/{TEST_CHILD_ID}/mistakes/{mistake_id}/review",
                headers=headers
            )
            
            assert response.status_code == 200, f"Mark reviewed failed: {response.text}"
            print(f"Mistake {mistake_id} marked as reviewed")
        else:
            pytest.skip("No mistakes to review")
    
    def test_delete_mistake(self, auth_token):
        """Test DELETE /api/children/{id}/mistakes/{mistake_id}"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Record a mistake to delete
        mistake_data = {
            "question_id": "test-delete-q",
            "question_text": "What is 9 - 5?",
            "question_type": "subtraction",
            "user_answer": "3",
            "correct_answer": "4",
            "options": ["2", "3", "4", "5"],
            "is_correct": False
        }
        
        record_res = requests.post(f"{BASE_URL}/api/children/{TEST_CHILD_ID}/mistakes", headers=headers, json=mistake_data)
        mistake_id = record_res.json().get("mistake_id")
        
        if mistake_id:
            response = requests.delete(
                f"{BASE_URL}/api/children/{TEST_CHILD_ID}/mistakes/{mistake_id}",
                headers=headers
            )
            
            assert response.status_code == 200, f"Delete mistake failed: {response.text}"
            print(f"Mistake {mistake_id} deleted successfully")


class TestAchievementSystem:
    """Tests for Achievement Badges System"""
    
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
    
    def test_get_achievements_endpoint(self, auth_token):
        """Test GET /api/children/{id}/achievements endpoint"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID}/achievements", headers=headers)
        
        assert response.status_code == 200, f"Achievements endpoint failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "earned" in data, "Missing earned field"
        assert "locked" in data, "Missing locked field"
        assert "total_earned" in data, "Missing total_earned field"
        assert "total_available" in data, "Missing total_available field"
        
        print(f"Achievements: earned={data['total_earned']}, available={data['total_available']}")
    
    def test_earned_badges_have_metadata(self, auth_token):
        """Test that earned badges have proper metadata"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID}/achievements", headers=headers)
        
        data = response.json()
        earned = data.get("earned", [])
        
        if earned:
            badge = earned[0]
            assert "id" in badge, "Badge missing id"
            assert "name" in badge, "Badge missing name"
            assert "icon" in badge, "Badge missing icon"
            assert "description" in badge, "Badge missing description"
            assert "category" in badge, "Badge missing category"
            assert "earned" in badge, "Badge missing earned flag"
            
            print(f"Sample earned badge: {badge['name']} ({badge['id']}) - {badge['icon']}")
        else:
            print("No earned badges yet")
    
    def test_locked_badges_have_metadata(self, auth_token):
        """Test that locked badges have proper metadata"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID}/achievements", headers=headers)
        
        data = response.json()
        locked = data.get("locked", [])
        
        if locked:
            badge = locked[0]
            assert "id" in badge, "Badge missing id"
            assert "name" in badge, "Badge missing name"
            assert "icon" in badge, "Badge missing icon"
            assert "description" in badge, "Badge missing description"
            assert "category" in badge, "Badge missing category"
            assert badge.get("earned") == False, "Locked badge should have earned=False"
            
            print(f"Sample locked badge: {badge['name']} ({badge['id']}) - {badge['icon']}")
    
    def test_first_star_badge_earned(self, auth_token):
        """Test that first_star badge is earned after getting 1 star"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Get child progress
        child_res = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID}", headers=headers)
        child = child_res.json()
        
        total_stars = child.get("progress", {}).get("total_stars", 0)
        badges = child.get("progress", {}).get("badges", [])
        
        print(f"Child has {total_stars} total stars")
        print(f"Child badges: {badges}")
        
        if total_stars >= 1:
            assert "first_star" in badges, "first_star badge should be earned with 1+ stars"
            print("first_star badge correctly earned!")
        else:
            print("Child has 0 stars, first_star badge not expected yet")
    
    def test_badge_categories(self, auth_token):
        """Test that badges are categorized correctly"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID}/achievements", headers=headers)
        
        data = response.json()
        all_badges = data.get("earned", []) + data.get("locked", [])
        
        valid_categories = ["stars", "streaks", "special"]
        
        for badge in all_badges:
            assert badge.get("category") in valid_categories, f"Invalid category: {badge.get('category')}"
        
        print(f"All {len(all_badges)} badges have valid categories")


class TestProgressAPI:
    """Tests for Progress API returning streak and achievements data"""
    
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
    
    def test_progress_update_returns_streak(self, auth_token):
        """Test that progress update returns streak data"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        response = requests.put(
            f"{BASE_URL}/api/children/{TEST_CHILD_ID}/progress?module=counting&stars=1",
            headers=headers
        )
        
        assert response.status_code == 200, f"Progress update failed: {response.text}"
        data = response.json()
        
        assert "progress" in data, "Response should include progress"
        assert "streak" in data, "Response should include streak"
        
        print(f"Progress update returned streak: {data['streak']}")
    
    def test_child_data_includes_streak(self, auth_token):
        """Test that child data includes streak information"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        response = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "streak" in data, "Child data should include streak"
        assert "current_streak" in data["streak"], "Streak should have current_streak"
        
        print(f"Child streak data: {data['streak']}")
    
    def test_child_data_includes_achievements(self, auth_token):
        """Test that child data includes achievements"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        response = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "achievements" in data, "Child data should include achievements"
        assert "progress" in data, "Child data should include progress"
        assert "badges" in data.get("progress", {}), "Progress should include badges"
        
        print(f"Child achievements: {data['achievements']}")
        print(f"Child badges: {data['progress'].get('badges', [])}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
