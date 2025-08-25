#!/bin/bash
# @file: scripts/prepare-deploy.sh
# @description: Скрипт подготовки к деплою на Koyeb
# @created: 2025-01-27

set -e

echo "🚀 Подготовка к деплою Neurohod Bot на Koyeb..."

# Проверяем, что мы в корне проекта
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: Запустите скрипт из корня проекта"
    exit 1
fi

# Проверяем наличие необходимых файлов
echo "📋 Проверка файлов..."
required_files=("Dockerfile" "package.json" "tsconfig.json" "src/index.ts")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Отсутствует файл: $file"
        exit 1
    fi
done

# Проверяем TypeScript
echo "🔍 Проверка TypeScript..."
npm run typecheck

# Собираем проект
echo "🔨 Сборка проекта..."
npm run build

# Проверяем, что сборка прошла успешно
if [ ! -d "dist" ]; then
    echo "❌ Ошибка: Папка dist не создана"
    exit 1
fi

# Проверяем Dockerfile
echo "🐳 Проверка Dockerfile..."
if command -v docker >/dev/null 2>&1; then
    if ! docker build --dry-run . > /dev/null 2>&1; then
        echo "❌ Ошибка в Dockerfile"
        exit 1
    fi
else
    echo "⚠️  Docker не установлен, пропускаем проверку Dockerfile"
fi

echo "✅ Подготовка завершена успешно!"
echo ""
echo "📝 Следующие шаги:"
echo "1. Закоммитьте изменения: git add . && git commit -m 'Prepare for Koyeb deployment'"
echo "2. Отправьте в репозиторий: git push origin main"
echo "3. Создайте секреты в Koyeb (см. KOYEB_DEPLOYMENT.md)"
echo "4. Задеплойте приложение через веб-интерфейс Koyeb"
echo ""
echo "📚 Подробные инструкции: KOYEB_DEPLOYMENT.md"
