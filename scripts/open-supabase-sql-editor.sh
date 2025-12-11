#!/bin/bash
# Open Supabase SQL Editor in browser with schema ready to paste

PROJECT_REF="ivikuadpgtutuqbhodcr"
SCHEMA_FILE="docs/SUPABASE_SCHEMA.sql"

echo "🚀 Opening Supabase SQL Editor..."
echo ""
echo "📋 Steps:"
echo "   1. SQL Editor will open in your browser"
echo "   2. Click 'New Query' if needed"
echo "   3. Copy the SQL from: $SCHEMA_FILE"
echo "   4. Paste in the editor"
echo "   5. Click 'Run'"
echo ""

# Open browser
if command -v open >/dev/null 2>&1; then
    open "https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
else
    echo "Please open manually: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
fi

echo ""
echo "📄 SQL file location: $(pwd)/$SCHEMA_FILE"
echo ""

