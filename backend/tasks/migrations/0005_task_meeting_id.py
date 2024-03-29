# Generated by Django 4.1.7 on 2023-05-02 23:18

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('meeting', '0001_initial'),
        ('tasks', '0004_task_task_description'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='meeting_id',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='tasks', to='meeting.meeting'),
            preserve_default=False,
        ),
    ]
