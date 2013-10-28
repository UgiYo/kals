#!/usr/bin/perl
###############################################################################
#                                                                             #
# IPFire.org - A linux based firewall                                         #
# Copyright (C) 2010  IPFire Team  <info@ipfire.org>                          #
#                                                                             #
# This program is free software: you can redistribute it and/or modify        #
# it under the terms of the GNU General Public License as published by        #
# the Free Software Foundation, either version 3 of the License, or           #
# (at your option) any later version.                                         #
#                                                                             #
# This program is distributed in the hope that it will be useful,             #
# but WITHOUT ANY WARRANTY; without even the implied warranty of              #
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the               #
# GNU General Public License for more details.                                #
#                                                                             #
# You should have received a copy of the GNU General Public License           #
# along with this program.  If not, see <http://www.gnu.org/licenses/>.       #
#                                                                             #
###############################################################################

use strict;
# enable only the following on debugging purpose
#use warnings;
#use CGI::Carp 'fatalsToBrowser';

require '/var/ipfire/general-functions.pl';
require "${General::swroot}/lang.pl";
require "${General::swroot}/header.pl";

my %extrahdsettings = ();
my $message = "";
my $errormessage = "";
my $size = "";
my $ok = "true";
my @tmp = ();
my @tmpline = ();
my $tmpentry = "";
my @devices = ();
my @deviceline = ();
my $deviceentry = "";
my @scans = ();
my @scanline = ();
my $scanentry = "";
my @partitions = ();
my @partitionline = ();
my $partitionentry = "";
my $devicefile = "/var/ipfire/extrahd/devices";
my $scanfile = "/var/ipfire/extrahd/scan";
my $partitionsfile = "/var/ipfire/extrahd/partitions";
system("/usr/local/bin/extrahdctrl scanhd ide");
system("/usr/local/bin/extrahdctrl scanhd partitions");

&Header::showhttpheaders();

### Values that have to be initialized
$extrahdsettings{'PATH'} = '';
$extrahdsettings{'FS'} = '';
$extrahdsettings{'DEVICE'} = '';
$extrahdsettings{'ACTION'} = '';
$extrahdsettings{'UUID'} = '';

&General::readhash("${General::swroot}/extrahd/settings", \%extrahdsettings);
&Header::getcgihash(\%extrahdsettings);

&Header::openpage('ExtraHD', 1, '');
&Header::openbigbox('100%', 'left', '', $errormessage);

############################################################################################################################
############################################################################################################################

if ($extrahdsettings{'ACTION'} eq $Lang::tr{'add'})
{
	open( FILE, "< $devicefile" ) or die "Unable to read $devicefile";
	@devices = <FILE>;
	close FILE;
	foreach $deviceentry (sort @devices)
	{
		@deviceline = split( /\;/, $deviceentry );
		if ( "$extrahdsettings{'PATH'}" eq "$deviceline[2]" ) {
			$ok = "false";
			$errormessage = "You can't mount $extrahdsettings{'DEVICE'} to $extrahdsettings{'PATH'}, because there is already a device mounted.";
		}
		if ( "$extrahdsettings{'PATH'}" eq "/" ) {
			$ok = "false";
			$errormessage = "You can't mount $extrahdsettings{'DEVICE'} to root /.";
		}
	}

	if ( "$ok" eq "true" ) {
		open(FILE, ">> $devicefile" ) or die "Unable to write $devicefile";
		print FILE <<END
UUID=$extrahdsettings{'UUID'};$extrahdsettings{'FS'};$extrahdsettings{'PATH'};
END
;
	system("/usr/local/bin/extrahdctrl mount $extrahdsettings{'PATH'}");
	}
} 
elsif ($extrahdsettings{'ACTION'} eq $Lang::tr{'delete'}) 
{
	if ( `/usr/local/bin/extrahdctrl umount $extrahdsettings{'PATH'}` ) {
		open( FILE, "< $devicefile" ) or die "Unable to read $devicefile";
		@tmp = <FILE>;
		close FILE;
		open( FILE, "> $devicefile" ) or die "Unable to write $devicefile";
		foreach $deviceentry (sort @tmp)
		{
			@tmpline = split( /\;/, $deviceentry );
			if ( $tmpline[2] ne $extrahdsettings{'PATH'} )
			{
				print FILE $deviceentry;
			}
		}
		close FILE;
	} else {
		$errormessage = "Can't umount $extrahdsettings{'PATH'}. Maybe the device is in use?";
	}
}

if ($errormessage) {
        &Header::openbox('100%', 'left', $Lang::tr{'error messages'});
        print "<class name='base'>$errormessage\n";
        print "&nbsp;</class>\n";
        &Header::closebox();
}

############################################################################################################################
############################################################################################################################

&Header::openbox('100%', 'center', $Lang::tr{'extrahd'});
	open( FILE, "< $devicefile" ) or die "Unable to read $devicefile";
	@devices = <FILE>;
	close FILE;
	print <<END
		<table border='0' width='600' cellspacing="0">
END
;
	foreach $deviceentry (sort @devices)
	{
		@deviceline = split( /\;/, $deviceentry );
		my $color="$Header::colourred";
		if ( ! `/bin/mountpoint $deviceline[2] | grep " not "`  ) {
			$color=$Header::colourgreen;
		}
		print <<END
			<tr><td colspan="5">&nbsp;
			<tr><td align='center'><font color=$color><b>$deviceline[0]</b></font>
				<td align='center'>$deviceline[1]
				<td align='center'>$deviceline[2]
				<td align='center'>
					<form method='post' action='$ENV{'SCRIPT_NAME'}'>
						<input type='hidden' name='DEVICE' value='$deviceline[0]' />
						<input type='hidden' name='FS' value='$deviceline[1]' />
						<input type='hidden' name='PATH' value='$deviceline[2]' />
						<input type='hidden' name='ACTION' value=$Lang::tr{'delete'} />
						<input type='image' alt=$Lang::tr{'delete'} src='/images/delete.gif' />
					</form>
END
;
	}
	print <<END
		</table>
END
;

&Header::closebox();

&Header::openbox('100%', 'center', $Lang::tr{'extrahd detected drives'});
	print <<END
		<table border='0' width='600' cellspacing="0">
END
;
	open( FILE, "< $scanfile" ) or die "Unable to read $scanfile";
	@scans = <FILE>;
	close FILE;
	open( FILE, "< $partitionsfile" ) or die "Unable to read $partitionsfile";
	@partitions = <FILE>;
	close FILE;
	foreach $scanentry (sort @scans)
	{
		@scanline = split( /\;/, $scanentry );
		print <<END
			<tr><td colspan="5">&nbsp;
			<tr><td align='left' colspan="2"><b>/dev/$scanline[0]</b>
				<td align='center' colspan="2">$scanline[1]
END
;
		foreach $partitionentry (sort @partitions)
		{
			@partitionline = split( /\;/, $partitionentry );
			if ( "$partitionline[0]" eq "$scanline[0]" ) {
				$size = int($partitionline[1] / 1024);
				print <<END
				<td align='center'>$Lang::tr{'size'} $size MB
				<td>&nbsp;
				<tr><td colspan="5">&nbsp;
END
;
			}
		}

		foreach $partitionentry (sort @partitions)
		{
			@partitionline = split( /\;/, $partitionentry );
			if (( "$partitionline[0]" =~ /^$scanline[0]/ ) && !( "$partitionline[2]" eq "" )) {
				$size = int($partitionline[1] / 1024);
				print <<END
				<form method='post' action='$ENV{'SCRIPT_NAME'}'>
				<tr><td align="left" colspan=5><b>UUID=$partitionline[2]</b></td></tr>
				<tr>
				<td align="list">/dev/$partitionline[0]</td>
				<td align="center">$Lang::tr{'size'} $size MB
				<td align="center"><select name="FS">
										<option value="auto">auto</option>
										<option value="ext3">ext3</option>
										<option value="reiserfs">reiserfs</option>
										<option value="vfat">fat</option>
										<option value="ntfs-3g">ntfs (experimental)</option>
									   </select>
				<td align="center"><input type='text' name='PATH' value=/mnt/harddisk />
				<td align="center">
					<input type='hidden' name='DEVICE' value='$partitionline[0]' />
					<input type='hidden' name='UUID' value='$partitionline[2]' />
					<input type='hidden' name='ACTION' value=$Lang::tr{'add'} />
					<input type='image' alt=$Lang::tr{'add'} src='/images/add.gif' />
				</form>

END
;
			}
		}
	}

	print <<END
	<tr><td align="center" colspan="5">If your device isn't listed here, you need to install or load the driver.<br />If you can see your device but no partitions you have to create them first.
	</table>
END
;
&Header::closebox();

&Header::closebigbox();
&Header::closepage();
