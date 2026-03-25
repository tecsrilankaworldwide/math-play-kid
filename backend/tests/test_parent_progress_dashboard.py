"""
Test Parent Progress Dashboard Analytics API
Tests the GET /api/children/{id}/analytics endpoint for parent dashboard
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_PARENT_EMAIL = "testparent@test.com"
TEST_PARENT_PASSWORD = "test123"
TEST_CHILD_ID = "cd57e76c-02e9-4276-a7c5-f0f7588a9670"  # Namal


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test parent"""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_PARENT_EMAIL, "password": TEST_PARENT_PASSWORD}
    )
    assert response.status_code == 200, f"Login failed: {response.text}"
    return response.json()["token"]


@pytest.fixture(scope="module")
def api_client(auth_token):
    """Create authenticated session"""
    session = requests.Session()
    session.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {auth_token}"
    })
    return session


class TestAnalyticsEndpoint:
    """Test GET /api/children/{id}/analytics endpoint"""
    
    def test_analytics_endpoint_returns_200(self, api_client):
        """Analytics endpoint returns 200 for valid child"""
        response = api_client.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID}/analytics")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("✓ Analytics endpoint returns 200")
    
    def test_analytics_response_has_child_info(self, api_client):
        """Response contains child information"""
        response = api_client.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID}/analytics")
        data = response.json()
        
        assert "child" in data, "Missing 'child' field"
        child = data["child"]
        assert "id" in child, "Missing child id"
        assert "name" in child, "Missing child name"
        assert "age" in child, "Missing child age"
        assert "age_category" in child, "Missing child age_category"
        
        # Verify Namal's data
        assert child["name"] == "namal", f"Expected 'namal', got {child['name']}"
        assert child["age"] == 14, f"Expected age 14, got {child['age']}"
        print("✓ Response contains correct child info")
    
    def test_analytics_has_improvement_metrics(self, api_client):
        """Response contains improvement metrics"""
        response = api_client.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID}/analytics")
        data = response.json()
        
        assert "improvement" in data, "Missing 'improvement' field"
        improvement = data["improvement"]
        
        required_fields = [
            "total_stars", "total_badges", "current_streak", "longest_streak",
            "total_attempts", "accuracy", "questions_today", "best_day_questions",
            "login_days", "mistakes_reviewed", "total_mistakes"
        ]
        
        for field in required_fields:
            assert field in improvement, f"Missing improvement field: {field}"
        
        # Verify Namal's stats
        assert improvement["total_stars"] == 8, f"Expected 8 stars, got {improvement['total_stars']}"
        assert improvement["accuracy"] == 50.0, f"Expected 50% accuracy, got {improvement['accuracy']}"
        assert improvement["total_badges"] == 3, f"Expected 3 badges, got {improvement['total_badges']}"
        print("✓ Response contains correct improvement metrics")
    
    def test_analytics_has_module_performance(self, api_client):
        """Response contains module performance data for bar chart"""
        response = api_client.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID}/analytics")
        data = response.json()
        
        assert "module_performance" in data, "Missing 'module_performance' field"
        modules = data["module_performance"]
        
        assert len(modules) == 4, f"Expected 4 modules, got {len(modules)}"
        
        module_names = [m["module"] for m in modules]
        assert "Counting" in module_names, "Missing Counting module"
        assert "Numbers" in module_names, "Missing Numbers module"
        assert "Addition" in module_names, "Missing Addition module"
        assert "Shapes" in module_names, "Missing Shapes module"
        
        # Each module should have stars and color
        for module in modules:
            assert "stars" in module, f"Missing stars for {module['module']}"
            assert "color" in module, f"Missing color for {module['module']}"
        
        # Verify Namal has 8 stars in Addition
        addition = next(m for m in modules if m["module"] == "Addition")
        assert addition["stars"] == 8, f"Expected 8 Addition stars, got {addition['stars']}"
        print("✓ Response contains correct module performance data")
    
    def test_analytics_has_weak_topics(self, api_client):
        """Response contains weak topics identification"""
        response = api_client.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID}/analytics")
        data = response.json()
        
        assert "weak_topics" in data, "Missing 'weak_topics' field"
        weak_topics = data["weak_topics"]
        
        # Namal has 4 mistakes in Addition
        assert len(weak_topics) > 0, "Expected at least one weak topic"
        
        for topic in weak_topics:
            assert "topic" in topic, "Missing topic name"
            assert "mistakes" in topic, "Missing mistakes count"
            assert "reviewed" in topic, "Missing reviewed count"
            assert "unreviewed" in topic, "Missing unreviewed count"
        
        # Verify Addition is a weak topic
        addition_topic = next((t for t in weak_topics if "Addition" in t["topic"]), None)
        assert addition_topic is not None, "Addition should be a weak topic"
        assert addition_topic["mistakes"] == 4, f"Expected 4 mistakes, got {addition_topic['mistakes']}"
        print("✓ Response contains correct weak topics data")
    
    def test_analytics_has_daily_activity(self, api_client):
        """Response contains 14-day activity calendar"""
        response = api_client.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID}/analytics")
        data = response.json()
        
        assert "daily_activity" in data, "Missing 'daily_activity' field"
        daily_activity = data["daily_activity"]
        
        assert len(daily_activity) == 14, f"Expected 14 days, got {len(daily_activity)}"
        
        for day in daily_activity:
            assert "date" in day, "Missing date field"
            assert "practiced" in day, "Missing practiced field"
            assert isinstance(day["practiced"], bool), "practiced should be boolean"
        
        # At least one day should be practiced (today)
        practiced_days = [d for d in daily_activity if d["practiced"]]
        assert len(practiced_days) >= 1, "Expected at least one practiced day"
        print("✓ Response contains correct daily activity data")
    
    def test_analytics_has_achievement_timeline(self, api_client):
        """Response contains recent achievements"""
        response = api_client.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID}/analytics")
        data = response.json()
        
        assert "achievement_timeline" in data, "Missing 'achievement_timeline' field"
        achievements = data["achievement_timeline"]
        
        # Namal has 3 badges
        assert len(achievements) == 3, f"Expected 3 achievements, got {len(achievements)}"
        
        for ach in achievements:
            assert "badge" in ach, "Missing badge field"
            assert "name" in ach, "Missing name field"
            assert "earned_at" in ach, "Missing earned_at field"
        
        # Verify badges
        badge_names = [a["badge"] for a in achievements]
        assert "first_star" in badge_names, "Missing first_star badge"
        assert "five_stars" in badge_names, "Missing five_stars badge"
        assert "never_give_up" in badge_names, "Missing never_give_up badge"
        print("✓ Response contains correct achievement timeline")
    
    def test_analytics_has_progress_timeline(self, api_client):
        """Response contains progress over time data for area chart"""
        response = api_client.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID}/analytics")
        data = response.json()
        
        assert "progress_timeline" in data, "Missing 'progress_timeline' field"
        timeline = data["progress_timeline"]
        
        assert len(timeline) > 0, "Expected at least one progress point"
        
        for point in timeline:
            assert "date" in point, "Missing date field"
            assert "stars" in point, "Missing stars field"
        
        # Stars should be increasing
        stars_values = [p["stars"] for p in timeline]
        assert stars_values == sorted(stars_values), "Stars should be in ascending order"
        print("✓ Response contains correct progress timeline")
    
    def test_analytics_has_summary(self, api_client):
        """Response contains summary with performance indicators"""
        response = api_client.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID}/analytics")
        data = response.json()
        
        assert "summary" in data, "Missing 'summary' field"
        summary = data["summary"]
        
        assert "overall_performance" in summary, "Missing overall_performance"
        assert "streak_status" in summary, "Missing streak_status"
        assert "engagement_level" in summary, "Missing engagement_level"
        
        # Verify Namal's summary (50% accuracy = "Needs Practice")
        assert summary["overall_performance"] == "Needs Practice", f"Expected 'Needs Practice', got {summary['overall_performance']}"
        print("✓ Response contains correct summary")
    
    def test_analytics_requires_authentication(self):
        """Analytics endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID}/analytics")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Analytics endpoint requires authentication")
    
    def test_analytics_returns_404_for_invalid_child(self, api_client):
        """Analytics returns 404 for non-existent child"""
        response = api_client.get(f"{BASE_URL}/api/children/invalid-child-id/analytics")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Analytics returns 404 for invalid child")
    
    def test_analytics_returns_404_for_other_users_child(self, api_client):
        """Analytics returns 404 when accessing another user's child"""
        # Create a fake child ID that doesn't belong to test parent
        fake_child_id = "00000000-0000-0000-0000-000000000000"
        response = api_client.get(f"{BASE_URL}/api/children/{fake_child_id}/analytics")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Analytics returns 404 for other user's child")


class TestAnalyticsDataIntegrity:
    """Test data integrity and calculations"""
    
    def test_accuracy_calculation(self, api_client):
        """Accuracy is correctly calculated from attempts"""
        response = api_client.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID}/analytics")
        data = response.json()
        
        improvement = data["improvement"]
        total_attempts = improvement["total_attempts"]
        accuracy = improvement["accuracy"]
        
        # Namal: 14 attempts, 7 correct = 50% accuracy
        expected_correct = round(total_attempts * accuracy / 100)
        assert expected_correct == 7, f"Expected 7 correct answers, calculated {expected_correct}"
        print("✓ Accuracy calculation is correct")
    
    def test_module_stars_sum_equals_total(self, api_client):
        """Sum of module stars equals total stars"""
        response = api_client.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID}/analytics")
        data = response.json()
        
        modules = data["module_performance"]
        total_from_modules = sum(m["stars"] for m in modules)
        total_stars = data["improvement"]["total_stars"]
        
        assert total_from_modules == total_stars, f"Module sum {total_from_modules} != total {total_stars}"
        print("✓ Module stars sum equals total stars")
    
    def test_weak_topics_unreviewed_calculation(self, api_client):
        """Unreviewed = mistakes - reviewed"""
        response = api_client.get(f"{BASE_URL}/api/children/{TEST_CHILD_ID}/analytics")
        data = response.json()
        
        for topic in data["weak_topics"]:
            expected_unreviewed = topic["mistakes"] - topic["reviewed"]
            assert topic["unreviewed"] == expected_unreviewed, f"Unreviewed calculation wrong for {topic['topic']}"
        print("✓ Unreviewed calculation is correct")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
