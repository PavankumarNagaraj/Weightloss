#!/usr/bin/env python3
import urllib.request
import urllib.parse
import json
import sys
import os

SUPABASE_URL = "https://capvowxxembnycdonghv.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhcHZvd3h4ZW1ibnljZG9uZ2h2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTI3NzUwOSwiZXhwIjoyMDgwODUzNTA5fQ.mYDzucrg1MrN51BGZ5W09nL6ohrHv6j3-2xsA-m6G2E"

# Connection string for direct PostgreSQL access
# Using db hostname instead of pooler
DB_URL = f"postgresql://postgres:sb_secret_JVr20pffLxVYMmjrK5L6rw_8UrwlSxU@db.capvowxxembnycdonghv.supabase.co:5432/postgres"

def execute_sql_file(filename):
    """Execute a SQL file using psycopg2"""
    try:
        import psycopg2
    except ImportError:
        print("❌ psycopg2 not installed. Installing...")
        os.system("pip3 install psycopg2-binary")
        import psycopg2
    
    print(f"\n📄 Executing: {filename}")
    
    with open(f"./supabase_migrations/{filename}", 'r') as f:
        sql = f.read()
    
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        cur.execute(sql)
        conn.commit()
        cur.close()
        conn.close()
        print(f"✅ Success")
        return True
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def query_supabase(table, select="*", filters=None):
    """Query Supabase using REST API"""
    url = f"{SUPABASE_URL}/rest/v1/{table}?select={select}"
    if filters:
        url += f"&{filters}"
    
    headers = {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': f'Bearer {SERVICE_ROLE_KEY}'
    }
    
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print(f"Error querying {table}: {e}")
        return None

def main():
    print("🚀 Starting Micronutrient Migration\n")
    print("=" * 60)
    
    files = [
        '00_add_micronutrient_columns.sql',
        'add_micronutrients_batch_1.sql',
        'add_micronutrients_batch_2.sql',
        'add_micronutrients_batch_3.sql',
        'add_micronutrients_batch_4.sql',
        'add_micronutrients_batch_5.sql',
        'add_micronutrients_batch_6_missing.sql',
        '99_add_micronutrients_to_dishes.sql'
    ]
    
    for file in files:
        if not execute_sql_file(file):
            print(f"\n❌ Migration stopped at {file}")
            sys.exit(1)
    
    print("\n" + "=" * 60)
    print("🔍 VERIFICATION RESULTS\n")
    
    # Query nutrition_reference
    print("📊 nutrition_reference table:")
    nr_data = query_supabase('nutrition_reference', 'ingredient_name,vitamin_a_mcg')
    if nr_data:
        total = len(nr_data)
        with_micros = sum(1 for r in nr_data if r.get('vitamin_a_mcg') is not None)
        print(f"   Total items: {total}")
        print(f"   With micronutrients: {with_micros}")
        print(f"   Coverage: {(with_micros/total*100):.1f}%")
    
    # Query cafe_inventory
    print("\n📊 cafe_inventory table:")
    ci_data = query_supabase('cafe_inventory', 'name,vitamin_a_mcg,category')
    if ci_data:
        total = len(ci_data)
        with_micros = sum(1 for r in ci_data if r.get('vitamin_a_mcg') is not None)
        without_micros = [r for r in ci_data if r.get('vitamin_a_mcg') is None]
        
        print(f"   Total items: {total}")
        print(f"   With micronutrients: {with_micros}")
        print(f"   Without micronutrients: {len(without_micros)}")
        print(f"   Coverage: {(with_micros/total*100):.1f}%")
        
        if without_micros:
            print("\n   Items without micronutrients (non-food items):")
            grouped = {}
            for item in without_micros:
                cat = item.get('category', 'Unknown')
                if cat not in grouped:
                    grouped[cat] = []
                grouped[cat].append(item['name'])
            
            for category in sorted(grouped.keys()):
                print(f"   {category}: {len(grouped[category])} items")
    
    # Sample data
    print("\n📊 Sample micronutrient data:")
    sample_items = ['Apple', 'Tomatoes', 'Chicken Breast (cooked)', 'Spinach']
    for item_name in sample_items:
        data = query_supabase('nutrition_reference', 
                            'ingredient_name,vitamin_c_mg,calcium_mg,iron_mg',
                            f'ingredient_name=eq.{urllib.parse.quote(item_name)}')
        if data and len(data) > 0 and data[0].get('vitamin_c_mg') is not None:
            item = data[0]
            print(f"   {item['ingredient_name']}: Vit C={item['vitamin_c_mg']}mg, Ca={item['calcium_mg']}mg, Fe={item['iron_mg']}mg")
    
    print("\n" + "=" * 60)
    print("✨ Migration Complete!\n")

if __name__ == "__main__":
    main()
