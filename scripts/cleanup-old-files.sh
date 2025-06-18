#!/bin/bash
# ========================================
# cleanup-old-files.sh
# سكريپت تنظيف الملفات القديمة من مجلد قاعدة البيانات
# ========================================

echo "🧹 تنظيف الملفات القديمة من مجلد قاعدة البيانات"
echo "================================================="

cd db

# الملفات القديمة التي سيتم حذفها
OLD_FILES=(
    "00-drop-old-tables.sql"
    "01-extensions-and-helpers.sql"
    "02-create-users.sql"
    "02-notes.sql"
    "03-create-clients.sql"
    "03-projects.sql"
    "03.5-streaks.sql"
    "04-create-projects.sql"
    "04-scenarios.sql"
    "05-create-logos.sql"
    "05-mirror.sql"
    "06-create-files.sql"
    "06-logos.sql"
    "07-create-categories-tags.sql"
    "07-test-data.sql"
    "08-create-logo-categories-tags.sql"
    "08-views.sql"
    "09-create-comments.sql"
    "09-master.sql"
    "add-streaks-table.sql"
    "catalyst-database.sql"
    "check-database-status.sql"
    "cleanup-database.sql"
    "complete-database-setup-final.sql"
    "complete-database-setup-fixed.sql"
    "complete-database-setup.sql"
    "database-schema.sql"
    "fresh-database-setup.sql"
    "logos-database-setup.sql"
    "logos-test-data.sql"
    "mirror-database-setup-fixed.sql"
    "mirror-database-setup.sql"
    "nexus-compatible-database-setup.sql"
    "oracle-database-setup.sql"
    "quick-fix.sql"
    "rebuild-database.sql"
    "schema_info.sql"
    "setup-new-database.sql"
    "test-data-setup.sql"
    "test-data.sql"
)

DELETED_COUNT=0

for file in "${OLD_FILES[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo "✅ حُذف: $file"
        ((DELETED_COUNT++))
    fi
done

echo ""
echo "📊 إحصائيات التنظيف:"
echo "  ✅ تم حذف: $DELETED_COUNT ملف"
echo ""
echo "🎉 تم تنظيف مجلد قاعدة البيانات بنجاح!"
echo ""
echo "📄 الملفات المتبقية الحديثة:"
ls -la *.sql | grep "^.*[0-9][0-9]-.*"
echo ""
echo "================================================="
