CREATE TABLE members (
    member_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    member_name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    can_edit_history BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE chores (
    chore_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    chore_name TEXT NOT NULL UNIQUE,
    daily BOOLEAN NOT NULL DEFAULT FALSE,
    max_per_day INT NOT NULL CHECK (max_per_day >= 1) DEFAULT 1
);

CREATE TABLE assignments (
    assignment_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    assign_date DATE NOT NULL DEFAULT CURRENT_DATE,
    quantity INT NOT NULL CHECK (quantity >= 1) DEFAULT 1,
    chore_id INT NOT NULL REFERENCES chores (chore_id) ON DELETE CASCADE,
    member_id INT NOT NULL REFERENCES members (member_id) ON DELETE CASCADE,
    CONSTRAINT unique_member_chore_date UNIQUE (member_id, chore_id, assign_date)
);