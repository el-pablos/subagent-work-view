#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="https://live-agents.tams.codes/api/v1"
PASSED=0
FAILED=0

echo "================================================"
echo "  Route Testing - Live Agents API"
echo "================================================"
echo ""

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local expected_code=${4:-200}

    echo -n "Testing $method $endpoint ... "

    response=$(curl -s -X $method \
        -w "\n%{http_code}" \
        -H "Content-Type: application/json" \
        -H "Accept: application/json" \
        "${API_URL}${endpoint}" 2>&1)

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" -eq "$expected_code" ] || [ "$http_code" -eq "200" ] || [ "$http_code" -eq "201" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        echo "  Expected: $expected_code"
        echo "  Response: $(echo $body | head -c 200)"
        ((FAILED++))
        return 1
    fi
}

echo "=== Health Check Endpoints ==="
test_endpoint "GET" "/health" "Health check" 200
test_endpoint "GET" "/health/agents" "Agent health check" 200
echo ""

echo "=== Agent Endpoints ==="
test_endpoint "GET" "/agents" "Get all agents" 200
test_endpoint "GET" "/agents/overview/stats" "Get agent stats" 200
# test_endpoint "GET" "/agents/1" "Get single agent" 200
# test_endpoint "POST" "/agents/1/heartbeat" "Agent heartbeat" 200
echo ""

echo "=== Session Endpoints ==="
test_endpoint "GET" "/sessions" "Get all sessions" 200
# test_endpoint "GET" "/sessions/1" "Get single session" 200
# test_endpoint "GET" "/sessions/1/timeline" "Get session timeline" 200
# test_endpoint "GET" "/sessions/1/messages" "Get session messages" 200
echo ""

echo "=== Task Endpoints ==="
test_endpoint "GET" "/tasks" "Get all tasks" 200
# test_endpoint "GET" "/tasks/1" "Get single task" 200
echo ""

echo "=== Dashboard Endpoints ==="
test_endpoint "GET" "/dashboard/overview" "Dashboard overview" 200
test_endpoint "GET" "/dashboard/agents" "Dashboard agents" 200
test_endpoint "GET" "/dashboard/active-sessions" "Active sessions" 200
test_endpoint "GET" "/dashboard/metrics" "Dashboard metrics" 200
echo ""

echo "================================================"
echo "  Test Results"
echo "================================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed!${NC}"
    exit 1
fi
