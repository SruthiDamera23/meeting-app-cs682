# Generated by Django 4.1.7 on 2023-04-12 15:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0003_task_priority'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='task_description',
            field=models.CharField(default='Not available', max_length=500),
            preserve_default=False,
        ),
    ]
