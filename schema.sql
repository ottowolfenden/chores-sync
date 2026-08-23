DROP SCHEMA public CASCADE; CREATE schema public;

CREATE TABLE members (
    member_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    member_name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_admin BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE chores (
    chore_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    chore_name TEXT NOT NULL UNIQUE,
    is_daily BOOLEAN NOT NULL DEFAULT false,
    limit_per_day INT DEFAULT NULL,
    CHECK (limit_per_day >= 1)
);

CREATE TABLE assignments (
    assignment_uuid UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    assign_date DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    quantity INT NOT NULL DEFAULT 1,
    is_offset BOOLEAN NOT NULL GENERATED ALWAYS AS (assign_date = '-infinity'),
    chore_id INT NOT NULL REFERENCES chores (chore_id) ON DELETE CASCADE,
    member_id INT NOT NULL REFERENCES members (member_id) ON DELETE CASCADE,
    UNIQUE (member_id, chore_id, assign_date),
    CHECK (assign_date = '-infinity' OR quantity >= 1)
);