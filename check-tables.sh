#!/bin/bash
PGPASSWORD=Minhtien2412 psql -h localhost -U postgres -d postgres -c "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"
