from django.db import models

class ChurchManager(models.Manager):
    def createChurch(self, **kwargs):
        return self.create(**kwargs)

class Church(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    address = models.CharField(max_length=200)
    ph_no = models.CharField(max_length=10)
    email = models.CharField(max_length=20, blank=True, null=True)
    website = models.CharField(max_length=30, blank=True, null=True)
    deleted = models.BooleanField(default=False)

    objects = ChurchManager()