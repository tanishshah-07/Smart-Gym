#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_USERS 200
#define MAX_MACHINES 10
#define MAX_REQ 5
#define MAX_SLOTS 4
#define SLOT_CAPACITY 60

typedef struct {
    char name[50];
    int quantity;
} Machine;

typedef struct {
    char name[50];
    int pref_slot;
    int priority;
    int num_req;
    int req_machines[MAX_REQ];
    int assigned_slot; // 1-4
    int dp_selected;   // 1 if selected by DP
} User;

int num_machines;
Machine machines[MAX_MACHINES];

int num_users;
User users[MAX_USERS];

// Slot tracking
int slot_users[MAX_SLOTS][MAX_USERS];
int slot_user_count[MAX_SLOTS];

int compare_users(const void* a, const void* b) {
    User* u1 = (User*)a;
    User* u2 = (User*)b;
    if (u1->priority != u2->priority)
        return u2->priority - u1->priority; // Descending priority
    return u1->pref_slot - u2->pref_slot;
}

// Map machine string to index
int get_machine_id(char* name) {
    for (int i = 0; i < num_machines; i++) {
        if (strcmp(machines[i].name, name) == 0) return i;
    }
    return -1;
}

// DP Memoization for up to 3 machines (to prevent memory explosion in C)
// Dimensions: user_idx, rem_m1, rem_m2, rem_m3
int* memo;
int memo_stride[4];

int get_memo(int u, int m1, int m2, int m3) {
    int idx = u * memo_stride[0] + m1 * memo_stride[1] + m2 * memo_stride[2] + m3;
    return memo[idx];
}

void set_memo(int u, int m1, int m2, int m3, int val) {
    int idx = u * memo_stride[0] + m1 * memo_stride[1] + m2 * memo_stride[2] + m3;
    memo[idx] = val;
}

// Recursive DP function
int solve_dp(int u_idx, int m1, int m2, int m3, int current_slot) {
    if (u_idx == slot_user_count[current_slot]) return 0;
    
    int cached = get_memo(u_idx, m1, m2, m3);
    if (cached != -1) return cached;
    
    int global_u_idx = slot_users[current_slot][u_idx];
    User u = users[global_u_idx];
    
    // Check if we can include this user
    int can_include = 1;
    int req_m1 = 0, req_m2 = 0, req_m3 = 0;
    int extra_fail = 0;
    
    for (int i = 0; i < u.num_req; i++) {
        int m_id = u.req_machines[i];
        if (m_id == 0) req_m1++;
        else if (m_id == 1) req_m2++;
        else if (m_id == 2) req_m3++;
        else {
            // For machines beyond the first 3, we just check if they have capacity > 0 (Greedy check for simplicity in DP)
            // Assuming infinite for DP, or strictly 1
            if (machines[m_id].quantity < 1) extra_fail = 1;
        }
    }
    
    if (req_m1 > m1 || req_m2 > m2 || req_m3 > m3 || extra_fail) {
        can_include = 0;
    }
    
    int excl = solve_dp(u_idx + 1, m1, m2, m3, current_slot);
    int incl = 0;
    
    if (can_include) {
        incl = u.priority + solve_dp(u_idx + 1, m1 - req_m1, m2 - req_m2, m3 - req_m3, current_slot);
    }
    
    int res = (incl > excl) ? incl : excl;
    set_memo(u_idx, m1, m2, m3, res);
    return res;
}

// Backtrack to find selected users
void backtrack_dp(int u_idx, int m1, int m2, int m3, int current_slot) {
    if (u_idx == slot_user_count[current_slot]) return;
    
    int global_u_idx = slot_users[current_slot][u_idx];
    User u = users[global_u_idx];
    
    int req_m1 = 0, req_m2 = 0, req_m3 = 0, extra_fail = 0;
    for (int i = 0; i < u.num_req; i++) {
        int m_id = u.req_machines[i];
        if (m_id == 0) req_m1++;
        else if (m_id == 1) req_m2++;
        else if (m_id == 2) req_m3++;
        else if (machines[m_id].quantity < 1) extra_fail = 1;
    }
    
    int can_include = !(req_m1 > m1 || req_m2 > m2 || req_m3 > m3 || extra_fail);
    
    int res = get_memo(u_idx, m1, m2, m3);
    int excl = solve_dp(u_idx + 1, m1, m2, m3, current_slot);
    
    if (can_include && res != excl) { // Means it must have been included
        users[global_u_idx].dp_selected = 1;
        backtrack_dp(u_idx + 1, m1 - req_m1, m2 - req_m2, m3 - req_m3, current_slot);
    } else {
        users[global_u_idx].dp_selected = 0;
        backtrack_dp(u_idx + 1, m1, m2, m3, current_slot);
    }
}

int main() {
    // 1. Parse Input
    if (scanf("%d", &num_machines) != 1) return 1;
    for (int i = 0; i < num_machines; i++) {
        scanf("%s %d", machines[i].name, &machines[i].quantity);
    }
    
    if (scanf("%d", &num_users) != 1) return 1;
    for (int i = 0; i < num_users; i++) {
        scanf("%s %d %d %d", users[i].name, &users[i].pref_slot, &users[i].priority, &users[i].num_req);
        for (int j = 0; j < users[i].num_req; j++) {
            char m_name[50];
            scanf("%s", m_name);
            users[i].req_machines[j] = get_machine_id(m_name);
        }
        users[i].assigned_slot = -1;
        users[i].dp_selected = 0;
    }
    
    // 2. Greedy Slot Assignment
    User sorted_users[MAX_USERS];
    memcpy(sorted_users, users, sizeof(User) * num_users);
    qsort(sorted_users, num_users, sizeof(User), compare_users);
    
    for (int i = 0; i < MAX_SLOTS; i++) slot_user_count[i] = 0;
    
    for (int i = 0; i < num_users; i++) {
        int u_id = -1;
        for (int j = 0; j < num_users; j++) {
            if (strcmp(users[j].name, sorted_users[i].name) == 0) {
                u_id = j; break;
            }
        }
        
        int pref = users[u_id].pref_slot - 1;
        int assigned = 0;
        
        // Try preferred slot first, then next slots
        for (int offset = 0; offset < MAX_SLOTS; offset++) {
            int target_slot = (pref + offset) % MAX_SLOTS;
            if (slot_user_count[target_slot] < SLOT_CAPACITY) {
                users[u_id].assigned_slot = target_slot + 1;
                slot_users[target_slot][slot_user_count[target_slot]] = u_id;
                slot_user_count[target_slot]++;
                assigned = 1;
                break;
            }
        }
        // If assigned == 0, waitlisted because all slots are full
    }
    
    // 3. Dynamic Programming for Equipment
    int cap1 = (num_machines > 0) ? machines[0].quantity : 0;
    int cap2 = (num_machines > 1) ? machines[1].quantity : 0;
    int cap3 = (num_machines > 2) ? machines[2].quantity : 0;
    
    int memo_size = 61 * (cap1 + 1) * (cap2 + 1) * (cap3 + 1);
    memo = (int*)malloc(memo_size * sizeof(int));
    
    memo_stride[3] = 1;
    memo_stride[2] = (cap3 + 1);
    memo_stride[1] = (cap2 + 1) * (cap3 + 1);
    memo_stride[0] = (cap1 + 1) * (cap2 + 1) * (cap3 + 1);
    
    for (int s = 0; s < MAX_SLOTS; s++) {
        // Reset memo for each slot
        memset(memo, -1, memo_size * sizeof(int));
        
        // Run DP
        solve_dp(0, cap1, cap2, cap3, s);
        backtrack_dp(0, cap1, cap2, cap3, s);
    }
    
    free(memo);
    
    // 4. Output JSON
    printf("{\n\"schedule\": [\n");
    int first_sched = 1;
    int total_scheduled = 0;
    
    for (int s = 0; s < MAX_SLOTS; s++) {
        for (int i = 0; i < slot_user_count[s]; i++) {
            int u_id = slot_users[s][i];
            if (users[u_id].dp_selected) {
                if (!first_sched) printf(",\n");
                printf("  {\"name\": \"%s\", \"slot\": %d, \"equipment\": [", users[u_id].name, users[u_id].assigned_slot);
                for(int j=0; j<users[u_id].num_req; j++) {
                    if (j>0) printf(", ");
                    printf("\"%s\"", machines[users[u_id].req_machines[j]].name);
                }
                printf("]}");
                first_sched = 0;
                total_scheduled++;
            }
        }
    }
    
    printf("\n],\n\"waitlist\": [\n");
    int first_wait = 1;
    int total_rejected = 0;
    
    for (int i = 0; i < num_users; i++) {
        if (!users[i].dp_selected) {
            if (!first_wait) printf(",\n");
            printf("  {\"name\": \"%s\", \"reason\": \"%s\"}", users[i].name, 
                   users[i].assigned_slot == -1 ? "Gym Full" : "Equipment Conflict");
            first_wait = 0;
            total_rejected++;
        }
    }
    
    printf("\n],\n\"slot_usage\": [\n");
    for (int s = 0; s < MAX_SLOTS; s++) {
        if (s > 0) printf(",\n");
        printf("  {\"slot\": %d, \"capacity\": %d, \"max\": %d}", s + 1, slot_user_count[s], SLOT_CAPACITY);
    }
    
    printf("\n],\n\"metrics\": {\n");
    printf("  \"total_users\": %d,\n", num_users);
    printf("  \"scheduled\": %d,\n", total_scheduled);
    printf("  \"rejected\": %d\n", total_rejected);
    printf("}\n}\n");

    return 0;
}
