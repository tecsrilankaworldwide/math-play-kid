import requests
import sys
from datetime import datetime
import json
import uuid

class MathPlaySubscriptionTester:
    def __init__(self, base_url="https://math-play-kids-3.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.user_token = None
        self.admin_token = None
        self.test_user_id = None
        self.test_child_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=default_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=default_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:300]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:300]}...")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:300]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def test_setup_admin(self):
        """Test admin setup"""
        success, data = self.run_test("Setup Admin", "POST", "setup/admin", 200)
        return success

    def test_pricing_endpoint(self):
        """Test pricing endpoint"""
        success, data = self.run_test("Get Pricing", "GET", "pricing", 200)
        if success:
            # Validate pricing structure
            expected_categories = ["age_5_6", "age_7", "age_8", "age_9", "age_10"]
            for category in expected_categories:
                if category not in data:
                    print(f"❌ Missing pricing category: {category}")
                    return False
                if 'monthly' not in data[category] or 'yearly' not in data[category]:
                    print(f"❌ Missing pricing data for {category}")
                    return False
            print(f"✅ Pricing structure valid")
        return success

    def test_user_registration(self):
        """Test user registration"""
        test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        test_data = {
            "name": "Test Parent",
            "email": test_email,
            "password": "testpass123"
        }
        success, data = self.run_test("User Registration", "POST", "auth/register", 200, test_data)
        if success:
            if 'token' in data and 'user' in data:
                self.user_token = data['token']
                self.test_user_id = data['user']['id']
                print(f"✅ User registered successfully - ID: {self.test_user_id}")
            else:
                print(f"❌ Registration response missing token or user")
                return False
        return success

    def test_user_login(self):
        """Test user login with admin credentials"""
        test_data = {
            "email": "admin@mathplay.com",
            "password": "admin123"
        }
        success, data = self.run_test("Admin Login", "POST", "auth/login", 200, test_data)
        if success:
            if 'token' in data and 'user' in data:
                self.admin_token = data['token']
                print(f"✅ Admin login successful")
            else:
                print(f"❌ Login response missing token or user")
                return False
        return success

    def test_get_user_profile(self):
        """Test getting user profile"""
        if not self.user_token:
            print("❌ No user token available")
            return False
        
        headers = {'Authorization': f'Bearer {self.user_token}'}
        success, data = self.run_test("Get User Profile", "GET", "auth/me", 200, headers=headers)
        if success:
            if 'id' in data and 'email' in data:
                print(f"✅ User profile retrieved successfully")
            else:
                print(f"❌ Profile response missing required fields")
                return False
        return success

    def test_create_child(self):
        """Test creating a child profile"""
        if not self.user_token:
            print("❌ No user token available")
            return False
        
        test_data = {
            "name": "Test Child",
            "age": 7
        }
        headers = {'Authorization': f'Bearer {self.user_token}'}
        success, data = self.run_test("Create Child", "POST", "children", 200, test_data, headers)
        if success:
            if 'id' in data and 'age_category' in data:
                self.test_child_id = data['id']
                print(f"✅ Child created successfully - ID: {self.test_child_id}")
            else:
                print(f"❌ Child creation response missing required fields")
                return False
        return success

    def test_get_children(self):
        """Test getting children list"""
        if not self.user_token:
            print("❌ No user token available")
            return False
        
        headers = {'Authorization': f'Bearer {self.user_token}'}
        success, data = self.run_test("Get Children", "GET", "children", 200, headers=headers)
        if success:
            if isinstance(data, list):
                print(f"✅ Children list retrieved - Count: {len(data)}")
            else:
                print(f"❌ Children response should be a list")
                return False
        return success

    def test_get_child_details(self):
        """Test getting specific child details"""
        if not self.user_token or not self.test_child_id:
            print("❌ No user token or child ID available")
            return False
        
        headers = {'Authorization': f'Bearer {self.user_token}'}
        success, data = self.run_test("Get Child Details", "GET", f"children/{self.test_child_id}", 200, headers=headers)
        if success:
            if 'id' in data and 'progress' in data:
                print(f"✅ Child details retrieved successfully")
            else:
                print(f"❌ Child details response missing required fields")
                return False
        return success

    def test_update_child_progress(self):
        """Test updating child progress"""
        if not self.user_token or not self.test_child_id:
            print("❌ No user token or child ID available")
            return False
        
        headers = {'Authorization': f'Bearer {self.user_token}'}
        success, data = self.run_test("Update Child Progress", "PUT", f"children/{self.test_child_id}/progress?module=counting&stars=1", 200, headers=headers)
        if success:
            if 'total_stars' in data and 'counting_stars' in data:
                print(f"✅ Child progress updated successfully")
            else:
                print(f"❌ Progress update response missing required fields")
                return False
        return success

    def test_question_generation(self):
        """Test question generation for all modules"""
        modules = ["counting", "numbers", "addition", "subtraction", "shapes", "quiz"]
        all_passed = True
        
        for module in modules:
            success, data = self.run_test(f"Get {module} question", "GET", f"question/{module}?age_category=age_7", 200)
            if success:
                # Validate question structure
                required_fields = ['id', 'type', 'question', 'options', 'correct_answer']
                for field in required_fields:
                    if field not in data:
                        print(f"❌ Missing field in {module} question: {field}")
                        all_passed = False
                        break
                
                # Check options length
                if len(data.get('options', [])) != 4:
                    print(f"❌ {module} question should have 4 options, got {len(data.get('options', []))}")
                    all_passed = False
                
                # Check if correct answer is in options
                if data.get('correct_answer') not in data.get('options', []):
                    print(f"❌ {module} correct answer not in options")
                    all_passed = False
                
                if all_passed:
                    print(f"✅ {module} question structure valid")
            else:
                all_passed = False
        
        return all_passed

    def test_manual_payment(self):
        """Test manual payment submission"""
        if not self.user_token or not self.test_child_id:
            print("❌ No user token or child ID available")
            return False
        
        test_data = {
            "child_id": self.test_child_id,
            "plan_type": "monthly",
            "age_category": "age_7",
            "reference_number": "TEST123456"
        }
        headers = {'Authorization': f'Bearer {self.user_token}'}
        success, data = self.run_test("Manual Payment", "POST", "payments/manual", 200, test_data, headers)
        if success:
            if 'message' in data and 'transaction_id' in data:
                print(f"✅ Manual payment submitted successfully")
            else:
                print(f"❌ Manual payment response missing required fields")
                return False
        return success

    def test_admin_stats(self):
        """Test admin stats endpoint"""
        if not self.admin_token:
            print("❌ No admin token available")
            return False
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        success, data = self.run_test("Admin Stats", "GET", "admin/stats", 200, headers=headers)
        if success:
            required_fields = ['total_users', 'total_children', 'active_subscriptions', 'total_revenue', 'pending_payments']
            for field in required_fields:
                if field not in data:
                    print(f"❌ Missing field in admin stats: {field}")
                    return False
            print(f"✅ Admin stats structure valid")
        return success

    def test_admin_users(self):
        """Test admin users endpoint"""
        if not self.admin_token:
            print("❌ No admin token available")
            return False
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        success, data = self.run_test("Admin Users", "GET", "admin/users", 200, headers=headers)
        if success:
            if isinstance(data, list):
                print(f"✅ Admin users list retrieved - Count: {len(data)}")
            else:
                print(f"❌ Admin users response should be a list")
                return False
        return success

    def test_admin_payments(self):
        """Test admin payments endpoint"""
        if not self.admin_token:
            print("❌ No admin token available")
            return False
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        success, data = self.run_test("Admin Payments", "GET", "admin/payments", 200, headers=headers)
        if success:
            if isinstance(data, list):
                print(f"✅ Admin payments list retrieved - Count: {len(data)}")
            else:
                print(f"❌ Admin payments response should be a list")
                return False
        return success

    def test_lesson_management(self):
        """Test lesson management CRUD operations"""
        if not self.admin_token:
            print("❌ No admin token available")
            return False
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        # Test 1: Get all lessons (initially empty)
        success, data = self.run_test("Get All Lessons", "GET", "admin/lessons", 200, headers=headers)
        if not success:
            return False
        
        initial_count = len(data) if isinstance(data, list) else 0
        print(f"✅ Initial lessons count: {initial_count}")
        
        # Test 2: Create a new lesson
        lesson_data = {
            "title": "Test Counting Lesson",
            "description": "A test lesson for counting objects",
            "age_category": "age_5_6",
            "module_type": "counting",
            "is_free": True,
            "content": {
                "questions": [
                    {
                        "question": "How many apples are there?",
                        "options": ["1", "2", "3", "4"],
                        "correct_answer": "3",
                        "visual_hint": "🍎🍎🍎"
                    },
                    {
                        "question": "Count the stars",
                        "options": ["2", "3", "4", "5"],
                        "correct_answer": "4",
                        "visual_hint": "⭐⭐⭐⭐"
                    }
                ]
            }
        }
        
        success, create_data = self.run_test("Create Lesson", "POST", "admin/lessons", 200, lesson_data, headers)
        if not success:
            return False
        
        if 'id' not in create_data:
            print("❌ Create lesson response missing lesson ID")
            return False
        
        lesson_id = create_data['id']
        print(f"✅ Lesson created with ID: {lesson_id}")
        
        # Test 3: Get specific lesson
        success, get_data = self.run_test("Get Specific Lesson", "GET", f"admin/lessons/{lesson_id}", 200, headers=headers)
        if not success:
            return False
        
        # Validate lesson data
        required_fields = ['id', 'title', 'description', 'age_category', 'module_type', 'is_free', 'content']
        for field in required_fields:
            if field not in get_data:
                print(f"❌ Missing field in lesson data: {field}")
                return False
        
        if get_data['title'] != lesson_data['title']:
            print(f"❌ Lesson title mismatch: expected {lesson_data['title']}, got {get_data['title']}")
            return False
        
        print(f"✅ Lesson data validated successfully")
        
        # Test 4: Update lesson
        update_data = {
            "title": "Updated Test Counting Lesson",
            "description": "An updated test lesson for counting objects",
            "age_category": "age_7",
            "module_type": "numbers",
            "is_free": False,
            "content": {
                "questions": [
                    {
                        "question": "What number is this?",
                        "options": ["5", "6", "7", "8"],
                        "correct_answer": "7",
                        "visual_hint": "7️⃣"
                    }
                ]
            }
        }
        
        success, update_response = self.run_test("Update Lesson", "PUT", f"admin/lessons/{lesson_id}", 200, update_data, headers)
        if not success:
            return False
        
        # Verify update
        success, updated_data = self.run_test("Get Updated Lesson", "GET", f"admin/lessons/{lesson_id}", 200, headers=headers)
        if not success:
            return False
        
        if updated_data['title'] != update_data['title']:
            print(f"❌ Lesson update failed: title not updated")
            return False
        
        if updated_data['age_category'] != update_data['age_category']:
            print(f"❌ Lesson update failed: age_category not updated")
            return False
        
        print(f"✅ Lesson updated successfully")
        
        # Test 5: Get lessons for child (test child access)
        if self.test_child_id:
            success, child_lessons = self.run_test("Get Lessons for Child", "GET", f"lessons/{self.test_child_id}", 200, headers={'Authorization': f'Bearer {self.user_token}'})
            if success:
                print(f"✅ Child lessons retrieved - Count: {len(child_lessons) if isinstance(child_lessons, list) else 0}")
            else:
                print("⚠️ Child lessons endpoint failed (may be expected if no matching age category)")
        
        # Test 6: Delete lesson
        success, delete_response = self.run_test("Delete Lesson", "DELETE", f"admin/lessons/{lesson_id}", 200, headers=headers)
        if not success:
            return False
        
        # Verify deletion
        success, verify_data = self.run_test("Verify Lesson Deleted", "GET", f"admin/lessons/{lesson_id}", 404, headers=headers)
        if not success:
            print("❌ Lesson should be deleted (404 expected)")
            return False
        
        print(f"✅ Lesson deleted successfully")
        
        # Test 7: Verify lessons count back to initial
        success, final_data = self.run_test("Final Lessons Count", "GET", "admin/lessons", 200, headers=headers)
        if success:
            final_count = len(final_data) if isinstance(final_data, list) else 0
            if final_count == initial_count:
                print(f"✅ Lessons count back to initial: {final_count}")
            else:
                print(f"⚠️ Lessons count mismatch: expected {initial_count}, got {final_count}")
        
        return True

def main():
    print("🚀 Starting MathPlay Kids Subscription Platform API Tests")
    print("=" * 60)
    
    # Setup
    tester = MathPlaySubscriptionTester()
    
    # Run all tests in order
    print("\n🔧 Testing Setup...")
    tester.test_setup_admin()
    
    print("\n💰 Testing Pricing...")
    tester.test_pricing_endpoint()
    
    print("\n👤 Testing User Authentication...")
    tester.test_user_registration()
    tester.test_user_login()
    tester.test_get_user_profile()
    
    print("\n👶 Testing Child Management...")
    tester.test_create_child()
    tester.test_get_children()
    tester.test_get_child_details()
    tester.test_update_child_progress()
    
    print("\n❓ Testing Question Generation...")
    tester.test_question_generation()
    
    print("\n💳 Testing Payment System...")
    tester.test_manual_payment()
    
    print("\n👑 Testing Admin Features...")
    tester.test_admin_stats()
    tester.test_admin_users()
    tester.test_admin_payments()
    
    print("\n📚 Testing Lesson Management...")
    tester.test_lesson_management()
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 FINAL RESULTS")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.failed_tests:
        print(f"\n❌ Failed Tests:")
        for test in tester.failed_tests:
            print(f"  - {test}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())