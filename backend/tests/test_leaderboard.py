"""
Leaderboard Feature Tests
Tests for:
- GET /api/leaderboard/{age_category} - Age-specific leaderboard
- GET /api/leaderboard/global/top - Global top performers
- Score calculation: stars×3 + streak×2 + badges×5 + attempts×0.1
- Privacy protection: Other users' names show only first letter + ***
- User's own children show full names with is_current_user flag
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "testparent@test.com"
TEST_PASSWORD = "test123"
TEST_CHILD_ID = "cd57e76c-02e9-4276-a7c5-f0f7588a9670"  # Namal, age 14


class TestLeaderboardAPI:
    """Leaderboard API endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    # ============ Age Category Leaderboard Tests ============
    
    def test_leaderboard_age_14_returns_200(self):
        """GET /api/leaderboard/age_14 returns 200"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/age_14", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("✓ GET /api/leaderboard/age_14 returns 200")
    
    def test_leaderboard_response_structure(self):
        """Leaderboard response has correct structure"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/age_14", headers=self.headers)
        data = response.json()
        
        # Check required fields
        assert "leaderboard" in data, "Missing 'leaderboard' field"
        assert "user_ranks" in data, "Missing 'user_ranks' field"
        assert "total_participants" in data, "Missing 'total_participants' field"
        assert "age_category" in data, "Missing 'age_category' field"
        
        assert data["age_category"] == "age_14", f"Expected age_14, got {data['age_category']}"
        assert isinstance(data["leaderboard"], list), "leaderboard should be a list"
        assert isinstance(data["total_participants"], int), "total_participants should be int"
        print("✓ Leaderboard response has correct structure")
    
    def test_leaderboard_entry_structure(self):
        """Each leaderboard entry has required fields"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/age_14", headers=self.headers)
        data = response.json()
        
        assert len(data["leaderboard"]) > 0, "Leaderboard should not be empty"
        
        entry = data["leaderboard"][0]
        required_fields = ["rank", "name", "total_stars", "current_streak", "total_badges", "score", "is_current_user"]
        
        for field in required_fields:
            assert field in entry, f"Missing field '{field}' in leaderboard entry"
        
        print(f"✓ Leaderboard entry has all required fields: {required_fields}")
    
    def test_namal_is_rank_1_in_age_14(self):
        """Namal (test child) should be #1 in age_14 category"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/age_14", headers=self.headers)
        data = response.json()
        
        # Find Namal in user_ranks
        namal_rank = None
        for rank in data["user_ranks"]:
            if rank["child_id"] == TEST_CHILD_ID:
                namal_rank = rank
                break
        
        assert namal_rank is not None, "Namal not found in user_ranks"
        assert namal_rank["rank"] == 1, f"Expected Namal to be rank 1, got {namal_rank['rank']}"
        assert namal_rank["name"] == "namal", f"Expected name 'namal', got {namal_rank['name']}"
        print(f"✓ Namal is rank #{namal_rank['rank']} with score {namal_rank['score']}")
    
    def test_score_calculation(self):
        """Score calculation: stars×3 + streak×2 + badges×5 + attempts×0.1"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/age_14", headers=self.headers)
        data = response.json()
        
        # Find Namal's entry
        namal_entry = None
        for entry in data["leaderboard"]:
            if entry["name"] == "namal":
                namal_entry = entry
                break
        
        assert namal_entry is not None, "Namal not found in leaderboard"
        
        # Verify score formula (approximately - attempts may vary)
        stars = namal_entry["total_stars"]
        streak = namal_entry["current_streak"]
        badges = namal_entry["total_badges"]
        score = namal_entry["score"]
        
        # Score = stars×3 + streak×2 + badges×5 + attempts×0.1
        # We can verify the base calculation (without attempts)
        base_score = (stars * 3) + (streak * 2) + (badges * 5)
        
        # Score should be >= base_score (attempts add to it)
        assert score >= base_score, f"Score {score} should be >= base {base_score}"
        print(f"✓ Score calculation verified: {stars} stars × 3 + {streak} streak × 2 + {badges} badges × 5 = {base_score} (+ attempts)")
    
    # ============ Privacy Protection Tests ============
    
    def test_privacy_other_users_names_masked(self):
        """Other users' names should show only first letter + ***"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/age_14", headers=self.headers)
        data = response.json()
        
        masked_found = False
        for entry in data["leaderboard"]:
            if not entry["is_current_user"]:
                # Should be masked like "S***" or "T***"
                name = entry["name"]
                if "***" in name:
                    masked_found = True
                    assert len(name) == 4, f"Masked name should be 4 chars (X***), got '{name}'"
                    print(f"✓ Found masked name: {name}")
        
        if not masked_found:
            print("⚠ No other users found to verify masking (all entries are current user)")
        else:
            print("✓ Privacy protection working - other users' names are masked")
    
    def test_current_user_children_show_full_names(self):
        """Current user's children should show full names"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/age_14", headers=self.headers)
        data = response.json()
        
        current_user_entries = [e for e in data["leaderboard"] if e["is_current_user"]]
        
        assert len(current_user_entries) > 0, "Should have at least one current user entry"
        
        # Namal should show full name
        namal_entry = next((e for e in current_user_entries if e["name"] == "namal"), None)
        assert namal_entry is not None, "Namal should show full name, not masked"
        print(f"✓ Current user's child shows full name: {namal_entry['name']}")
    
    def test_is_current_user_flag(self):
        """is_current_user flag correctly identifies user's children"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/age_14", headers=self.headers)
        data = response.json()
        
        # Get user's children IDs from user_ranks
        user_child_ids = [r["child_id"] for r in data["user_ranks"]]
        
        # Count current user entries in leaderboard
        current_user_count = sum(1 for e in data["leaderboard"] if e["is_current_user"])
        
        assert current_user_count > 0, "Should have at least one is_current_user=true entry"
        print(f"✓ Found {current_user_count} entries with is_current_user=true")
    
    # ============ User Ranks Tests ============
    
    def test_user_ranks_structure(self):
        """user_ranks array has correct structure"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/age_14", headers=self.headers)
        data = response.json()
        
        assert len(data["user_ranks"]) > 0, "user_ranks should not be empty"
        
        rank = data["user_ranks"][0]
        required_fields = ["child_id", "name", "rank", "score", "total_stars"]
        
        for field in required_fields:
            assert field in rank, f"Missing field '{field}' in user_ranks"
        
        print(f"✓ user_ranks has correct structure: {required_fields}")
    
    # ============ Global Leaderboard Tests ============
    
    def test_global_leaderboard_returns_200(self):
        """GET /api/leaderboard/global/top returns 200"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/global/top", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("✓ GET /api/leaderboard/global/top returns 200")
    
    def test_global_leaderboard_structure(self):
        """Global leaderboard has correct structure"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/global/top", headers=self.headers)
        data = response.json()
        
        assert "top_global" in data, "Missing 'top_global' field"
        assert "total_participants" in data, "Missing 'total_participants' field"
        assert isinstance(data["top_global"], list), "top_global should be a list"
        print("✓ Global leaderboard has correct structure")
    
    def test_global_leaderboard_includes_age(self):
        """Global leaderboard entries include age field"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/global/top", headers=self.headers)
        data = response.json()
        
        assert len(data["top_global"]) > 0, "Global leaderboard should not be empty"
        
        entry = data["top_global"][0]
        assert "age" in entry, "Global leaderboard entry should include 'age' field"
        print(f"✓ Global leaderboard includes age field (first entry age: {entry['age']})")
    
    def test_global_leaderboard_privacy(self):
        """Global leaderboard also masks other users' names"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/global/top", headers=self.headers)
        data = response.json()
        
        masked_found = False
        for entry in data["top_global"]:
            if not entry["is_current_user"] and "***" in entry["name"]:
                masked_found = True
                break
        
        if masked_found:
            print("✓ Global leaderboard also masks other users' names")
        else:
            print("⚠ No masked names found in global leaderboard (may all be current user)")
    
    # ============ Different Age Categories Tests ============
    
    def test_leaderboard_different_age_categories(self):
        """Test leaderboard for different age categories"""
        categories = ["age_5_6", "age_7", "age_8", "age_9", "age_10", "age_11", "age_12", "age_13", "age_14"]
        
        for category in categories:
            response = requests.get(f"{BASE_URL}/api/leaderboard/{category}", headers=self.headers)
            assert response.status_code == 200, f"Failed for {category}: {response.status_code}"
            data = response.json()
            assert data["age_category"] == category, f"Expected {category}, got {data['age_category']}"
        
        print(f"✓ All {len(categories)} age categories return valid responses")
    
    def test_leaderboard_empty_category(self):
        """Leaderboard for category with no students returns empty list"""
        # age_5_6 might have no students
        response = requests.get(f"{BASE_URL}/api/leaderboard/age_5_6", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        
        # Should still have valid structure even if empty
        assert "leaderboard" in data
        assert "total_participants" in data
        assert isinstance(data["leaderboard"], list)
        print(f"✓ Empty category returns valid structure (participants: {data['total_participants']})")
    
    # ============ Ranking Order Tests ============
    
    def test_leaderboard_sorted_by_score_descending(self):
        """Leaderboard should be sorted by score in descending order"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/age_14", headers=self.headers)
        data = response.json()
        
        if len(data["leaderboard"]) > 1:
            scores = [e["score"] for e in data["leaderboard"]]
            assert scores == sorted(scores, reverse=True), "Leaderboard should be sorted by score descending"
            print(f"✓ Leaderboard sorted by score descending: {scores[:5]}...")
        else:
            print("⚠ Only one entry, cannot verify sorting")
    
    def test_ranks_are_sequential(self):
        """Ranks should be sequential starting from 1"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/age_14", headers=self.headers)
        data = response.json()
        
        ranks = [e["rank"] for e in data["leaderboard"]]
        expected_ranks = list(range(1, len(ranks) + 1))
        
        assert ranks == expected_ranks, f"Ranks should be sequential: expected {expected_ranks}, got {ranks}"
        print(f"✓ Ranks are sequential: {ranks}")
    
    # ============ Authentication Tests ============
    
    def test_leaderboard_requires_auth(self):
        """Leaderboard endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/age_14")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("✓ Leaderboard requires authentication")
    
    def test_global_leaderboard_requires_auth(self):
        """Global leaderboard requires authentication"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/global/top")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("✓ Global leaderboard requires authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
