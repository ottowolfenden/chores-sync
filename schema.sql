CREATE TABLE members (
    member_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    member_name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    can_edit_today BOOLEAN NOT NULL DEFAULT TRUE,
    can_edit_history BOOLEAN NOT NULL DEFAULT TRUE,
    can_set_member_active_state BOOLEAN NOT NULL DEFAULT TRUE,
    can_add_members BOOLEAN NOT NULL DEFAULT TRUE,
    can_edit_possible_chores BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE chores (
    chore_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    chore_name TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL,
    daily BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE assignments (
    assignment_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    chore_id INT NOT NULL REFERENCES chores (chore_id) ON DELETE CASCADE,
    member_id INT NOT NULL REFERENCES members (member_id) ON DELETE CASCADE,
    assign_date DATE NOT NULL DEFAULT CURRENT_DATE,
    quantity INT NOT NULL CHECK (quantity >= 1 AND quantity <= 9) DEFAULT 1,
    completed boolean NOT NULL DEFAULT FALSE,
    CONSTRAINT unique_member_chore_date UNIQUE (member_id, chore_id, assign_date)
);