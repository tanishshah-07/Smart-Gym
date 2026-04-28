#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_USERS 1000
#define MAX_MACHINES 20
#define MAX_REQ 10
#define DAY_MINUTES 1440

typedef struct {
    int id;
    int start_time;
    int end_time;
    int duration;
    int priority;
    int num_req;
    int req_machines[MAX_REQ];
} User;

int num_machines;
int machine_capacity[MAX_MACHINES];
User users[MAX_USERS];
int num_users;

// --- Greedy Algorithm (Multi-Machine) ---
int compare_end_time(const void* a, const void* b) {
    User* u1 = (User*)a;
    User* u2 = (User*)b;
    if (u1->end_time != u2->end_time)
        return u1->end_time - u2->end_time;
    return u2->priority - u1->priority; // descending priority
}

int is_available(int machine_schedule[MAX_MACHINES][DAY_MINUTES], int m_id, int start, int end) {
    for (int t = start; t < end; t++) {
        if (machine_schedule[m_id][t] >= machine_capacity[m_id]) {
            return 0;
        }
    }
    return 1;
}

void solve_greedy() {
    User sorted_users[MAX_USERS];
    memcpy(sorted_users, users, sizeof(User) * num_users);
    qsort(sorted_users, num_users, sizeof(User), compare_end_time);

    int machine_schedule[MAX_MACHINES][DAY_MINUTES] = {0};
    int scheduled_count = 0;
    
    printf("\"greedy_schedule\": [\n");
    int first = 1;

    for (int i = 0; i < num_users; i++) {
        User u = sorted_users[i];
        if (u.num_req == 0) continue;
        
        int time_per_machine = u.duration / u.num_req;
        int current_start = u.start_time;
        int success = 0;
        
        while (current_start + u.duration <= u.end_time) {
            int seq_start = current_start;
            int can_schedule = 1;
            
            for (int j = 0; j < u.num_req; j++) {
                int seq_end = seq_start + time_per_machine;
                if (!is_available(machine_schedule, u.req_machines[j], seq_start, seq_end)) {
                    can_schedule = 0;
                    break;
                }
                seq_start = seq_end;
            }
            
            if (can_schedule) {
                seq_start = current_start;
                for (int j = 0; j < u.num_req; j++) {
                    int seq_end = seq_start + time_per_machine;
                    for (int t = seq_start; t < seq_end; t++) {
                        machine_schedule[u.req_machines[j]][t]++;
                    }
                    
                    if (!first) printf(",\n");
                    printf("  {\"user_id\": %d, \"machine_id\": %d, \"start\": %d, \"end\": %d}", 
                           u.id, u.req_machines[j], seq_start, seq_end);
                    first = 0;
                    
                    seq_start = seq_end;
                }
                scheduled_count++;
                success = 1;
                break;
            }
            current_start += 5; // shift by 5 mins
        }
    }
    printf("\n],\n\"greedy_count\": %d,\n", scheduled_count);
}

// --- Dynamic Programming Algorithm (Weighted Interval Scheduling - Exclusive Gym Access) ---
// Finds maximum priority subset of non-overlapping users (treats gym as single resource)
int latest_non_conflict(User arr[], int i) {
    for (int j = i - 1; j >= 0; j--) {
        if (arr[j].end_time <= arr[i].start_time)
            return j;
    }
    return -1;
}

void solve_dp() {
    User sorted_users[MAX_USERS];
    memcpy(sorted_users, users, sizeof(User) * num_users);
    qsort(sorted_users, num_users, sizeof(User), compare_end_time);

    int* dp = (int*)malloc(num_users * sizeof(int));
    int* choice = (int*)malloc(num_users * sizeof(int)); // 1 if included, 0 if not

    dp[0] = sorted_users[0].priority;
    choice[0] = 1;

    for (int i = 1; i < num_users; i++) {
        int incl_prof = sorted_users[i].priority;
        int l = latest_non_conflict(sorted_users, i);
        if (l != -1)
            incl_prof += dp[l];

        if (incl_prof > dp[i - 1]) {
            dp[i] = incl_prof;
            choice[i] = 1;
        } else {
            dp[i] = dp[i - 1];
            choice[i] = 0;
        }
    }

    printf("\"dp_max_priority\": %d,\n", dp[num_users - 1]);
    
    // Backtrack to find included users
    printf("\"dp_exclusive_users\": [\n");
    int curr = num_users - 1;
    int first = 1;
    while (curr >= 0) {
        if (choice[curr] == 1) {
            if (!first) printf(",\n");
            printf("  %d", sorted_users[curr].id);
            first = 0;
            
            int l = latest_non_conflict(sorted_users, curr);
            curr = l;
        } else {
            curr--;
        }
    }
    printf("\n]\n");

    free(dp);
    free(choice);
}

int main() {
    // Read Input
    if (scanf("%d", &num_machines) != 1) return 1;
    for (int i = 0; i < num_machines; i++) {
        scanf("%d", &machine_capacity[i]);
    }
    
    if (scanf("%d", &num_users) != 1) return 1;
    for (int i = 0; i < num_users; i++) {
        scanf("%d %d %d %d %d %d", 
              &users[i].id, &users[i].start_time, &users[i].end_time, 
              &users[i].duration, &users[i].priority, &users[i].num_req);
        for (int j = 0; j < users[i].num_req; j++) {
            scanf("%d", &users[i].req_machines[j]);
        }
    }

    printf("{\n");
    solve_greedy();
    solve_dp();
    printf("}\n");

    return 0;
}
