import requests
import sys
from datetime import datetime
import json

class MathPlayAPITester:
    def __init__(self, base_url="https://math-play-kids-3.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_get_progress(self):
        """Test getting progress data"""
        success, data = self.run_test("Get Progress", "GET", "progress", 200)
        if success:
            # Validate progress structure
            required_fields = ['total_stars', 'counting_stars', 'numbers_stars', 'addition_stars', 'shapes_stars', 'quiz_stars', 'badges']
            for field in required_fields:
                if field not in data:
                    print(f"❌ Missing field in progress: {field}")
                    return False
            print(f"✅ Progress structure valid")
        return success

    def test_update_progress(self):
        """Test updating progress"""
        test_data = {
            "module": "counting",
            "stars_earned": 1,
            "correct": True
        }
        success, data = self.run_test("Update Progress", "POST", "progress/update", 200, test_data)
        if success:
            # Check if stars were updated
            if 'counting_stars' in data and data['counting_stars'] >= 1:
                print(f"✅ Progress updated correctly - counting_stars: {data['counting_stars']}")
            else:
                print(f"❌ Progress not updated correctly")
                return False
        return success

    def test_question_endpoints(self):
        """Test all question endpoints"""
        modules = ["counting", "numbers", "addition", "subtraction", "shapes", "quiz"]
        all_passed = True
        
        for module in modules:
            success, data = self.run_test(f"Get {module} question", "GET", f"question/{module}", 200)
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

    def test_reset_progress(self):
        """Test reset progress endpoint"""
        success, data = self.run_test("Reset Progress", "POST", "reset-progress", 200)
        if success:
            # Check if progress was reset
            if data.get('total_stars') == 0:
                print(f"✅ Progress reset correctly")
            else:
                print(f"❌ Progress not reset correctly - total_stars: {data.get('total_stars')}")
                return False
        return success

def main():
    print("🚀 Starting MathPlay Kids API Tests")
    print("=" * 50)
    
    # Setup
    tester = MathPlayAPITester()
    
    # Run all tests
    print("\n📡 Testing API Connectivity...")
    tester.test_root_endpoint()
    
    print("\n📊 Testing Progress System...")
    tester.test_get_progress()
    tester.test_update_progress()
    
    print("\n❓ Testing Question Generation...")
    tester.test_question_endpoints()
    
    print("\n🔄 Testing Reset Functionality...")
    tester.test_reset_progress()
    
    # Print final results
    print("\n" + "=" * 50)
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